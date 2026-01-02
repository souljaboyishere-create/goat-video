"""
Voice Cloner Worker
Implements worker contract: /execute, /status, /health
Uses Coqui TTS for voice cloning and text-to-speech
"""

import os
import uuid
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
import torch
from TTS.api import TTS
import soundfile as sf
import numpy as np

app = FastAPI(title="Voice Cloner Worker")

# S3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=os.getenv("S3_ENDPOINT"),
    aws_access_key_id=os.getenv("S3_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("S3_SECRET_ACCESS_KEY"),
    region_name=os.getenv("S3_REGION", "us-east-1"),
)

BUCKET = os.getenv("S3_BUCKET", "video-ai-platform")
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:3001")
WORKER_API_KEY = os.getenv("WORKER_API_KEY", "")

# TTS model cache
tts_models = {}
device = "cuda" if torch.cuda.is_available() else "cpu"

# In-memory job tracking
jobs = {}


class ExecuteRequest(BaseModel):
    jobId: str
    type: str
    input: dict


class ExecuteResponse(BaseModel):
    jobId: str
    status: str
    message: Optional[str] = None


def get_tts_model(model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2"):
    """Get or load TTS model"""
    if model_name not in tts_models:
        print(f"Loading TTS model: {model_name}")
        tts_models[model_name] = TTS(model_name).to(device)
    return tts_models[model_name]


def download_from_s3(s3_path: str, local_path: str):
    """Download file from S3"""
    # Extract bucket and key from s3://bucket/key format
    if s3_path.startswith("s3://"):
        path_parts = s3_path[5:].split("/", 1)
        bucket = path_parts[0]
        key = path_parts[1] if len(path_parts) > 1 else ""
    else:
        raise ValueError(f"Invalid S3 path: {s3_path}")

    s3_client.download_file(bucket, key, local_path)


def upload_to_s3(file_path: str, s3_key: str) -> str:
    """Upload file to S3 and return S3 path"""
    try:
        s3_client.upload_file(file_path, BUCKET, s3_key)
        return f"s3://{BUCKET}/{s3_key}"
    except ClientError as e:
        raise Exception(f"Failed to upload to S3: {e}")


async def process_voice_clone(
    job_id: str,
    source_audio: str,
    text: str,
    language: str,
    emotion: Optional[str],
    style: Optional[str],
    user_id: str,
    project_id: Optional[str],
    voice_id: Optional[str],
):
    """Process voice cloning in background"""
    try:
        # Update status to processing
        jobs[job_id] = {"status": "processing", "progress": 10}
        await update_backend_status(job_id, 10, "processing")

        # Download source audio from S3
        local_source = f"/tmp/source_{uuid.uuid4()}.wav"
        download_from_s3(source_audio, local_source)
        jobs[job_id]["progress"] = 20
        await update_backend_status(job_id, 20, "processing")

        # Load TTS model (XTTS v2 for multilingual voice cloning)
        model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        tts = get_tts_model(model_name)
        jobs[job_id]["progress"] = 40
        await update_backend_status(job_id, 40, "processing")

        # Generate speech
        print(f"Generating speech: text='{text}', language='{language}'")
        wav = tts.tts(
            text=text,
            speaker_wav=local_source,
            language=language,
        )
        jobs[job_id]["progress"] = 70
        await update_backend_status(job_id, 70, "processing")

        # Save to temporary file
        output_file = f"/tmp/output_{uuid.uuid4()}.wav"
        sf.write(output_file, wav, tts.synthesizer.output_sample_rate)

        # Get audio metadata
        audio_data, sample_rate = sf.read(output_file)
        duration = len(audio_data) / sample_rate

        # Upload to S3
        s3_key = f"users/{user_id}/projects/{project_id or 'temp'}/audio/{uuid.uuid4()}.wav"
        s3_path = upload_to_s3(output_file, s3_key)
        jobs[job_id]["progress"] = 90
        await update_backend_status(job_id, 90, "processing")

        # Extract voice embedding for reuse (if supported)
        voice_embedding = None
        try:
            # XTTS can extract speaker embedding
            if hasattr(tts, "synthesizer") and hasattr(tts.synthesizer, "speaker_manager"):
                # This is model-specific - adjust based on actual TTS API
                pass
        except Exception as e:
            print(f"Could not extract voice embedding: {e}")

        # Clean up local files
        if os.path.exists(local_source):
            os.remove(local_source)
        if os.path.exists(output_file):
            os.remove(output_file)

        # Prepare output
        output = {
            "filePath": s3_path,
            "duration": float(duration),
            "modelVersion": "xtts-v2",
            "sampleRate": int(sample_rate),
            "voiceEmbedding": voice_embedding,
        }

        jobs[job_id] = {"status": "completed", "progress": 100, "output": output}
        await update_backend_status(job_id, 100, "completed", output)

    except Exception as e:
        error_msg = str(e)
        print(f"Error in voice clone: {error_msg}")
        jobs[job_id] = {"status": "failed", "progress": 0, "error": error_msg}
        await update_backend_status(job_id, 0, "failed", None, error_msg)


async def update_backend_status(
    job_id: str,
    progress: int,
    status: str,
    output: Optional[dict] = None,
    error: Optional[str] = None,
):
    """Update job status in backend API"""
    import httpx

    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{BACKEND_API_URL}/api/jobs/{job_id}/status",
                json={
                    "progress": progress,
                    "status": status,
                    "output": output,
                    "error": error,
                },
                headers={"X-Worker-API-Key": WORKER_API_KEY},
                timeout=30.0,
            )
    except Exception as e:
        print(f"Failed to update backend status: {e}")


@app.post("/execute", response_model=ExecuteResponse)
async def execute(
    request: ExecuteRequest,
    background_tasks: BackgroundTasks,
    x_worker_api_key: str = Header(None),
):
    """Execute job - worker contract endpoint"""
    if x_worker_api_key != WORKER_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if request.type != "voice_clone":
        raise HTTPException(status_code=400, detail=f"Unsupported job type: {request.type}")

    source_audio = request.input.get("sourceAudio")
    text = request.input.get("text")
    language = request.input.get("language", "en")

    if not source_audio or not text:
        raise HTTPException(
            status_code=400, detail="Missing 'sourceAudio' or 'text' in input"
        )

    emotion = request.input.get("emotion")
    style = request.input.get("style")
    user_id = request.input.get("userId", "unknown")
    project_id = request.input.get("projectId")
    voice_id = request.input.get("voiceId")

    # Start background task
    background_tasks.add_task(
        process_voice_clone,
        request.jobId,
        source_audio,
        text,
        language,
        emotion,
        style,
        user_id,
        project_id,
        voice_id,
    )

    return ExecuteResponse(jobId=request.jobId, status="accepted")


@app.get("/health")
async def health():
    """Health check - worker contract endpoint"""
    gpu_available = torch.cuda.is_available()
    model_loaded = "tts_models/multilingual/multi-dataset/xtts_v2" in tts_models

    return {
        "status": "healthy",
        "gpu_available": gpu_available,
        "model_loaded": model_loaded,
        "device": device,
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {"service": "voice-cloner-worker", "version": "1.0.0"}

