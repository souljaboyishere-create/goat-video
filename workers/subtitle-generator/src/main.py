"""
Subtitle Generator Worker
Implements worker contract: /execute, /status, /health
Uses Whisper (OpenAI) or faster-whisper for speech-to-text and subtitle generation
"""

import os
import uuid
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
import torch
import whisper
from faster_whisper import WhisperModel
import srt
from datetime import timedelta

app = FastAPI(title="Subtitle Generator Worker")

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

# Whisper model cache
whisper_models = {}
device = "cuda" if torch.cuda.is_available() else "cpu"
use_faster_whisper = os.getenv("USE_FASTER_WHISPER", "true").lower() == "true"
default_model = os.getenv("WHISPER_MODEL", "base")

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


def get_whisper_model(model_name: str = "base"):
    """Get or load Whisper model"""
    if model_name not in whisper_models:
        print(f"Loading Whisper model: {model_name} on {device}")
        if use_faster_whisper:
            whisper_models[model_name] = WhisperModel(
                model_name, device=device, compute_type="float16" if device == "cuda" else "int8"
            )
        else:
            whisper_models[model_name] = whisper.load_model(model_name, device=device)
        print(f"Model loaded successfully")
    return whisper_models[model_name]


def download_from_s3(s3_path: str, local_path: str):
    """Download file from S3"""
    if not s3_path.startswith("s3://"):
        raise ValueError(f"Invalid S3 path: {s3_path}")

    path_parts = s3_path[5:].split("/", 1)
    bucket = path_parts[0]
    key = path_parts[1] if len(path_parts) > 1 else ""

    s3_client.download_file(bucket, key, local_path)


def upload_to_s3(file_path: str, s3_key: str) -> str:
    """Upload file to S3 and return S3 path"""
    try:
        s3_client.upload_file(file_path, BUCKET, s3_key)
        return f"s3://{BUCKET}/{s3_key}"
    except ClientError as e:
        raise Exception(f"Failed to upload to S3: {e}")


def generate_srt(segments: List[dict], output_path: str):
    """Generate SRT file from segments"""
    subtitles = []
    for i, segment in enumerate(segments, start=1):
        start_time = timedelta(seconds=segment["start"])
        end_time = timedelta(seconds=segment["end"])
        text = segment["text"].strip()

        subtitle = srt.Subtitle(
            index=i,
            start=start_time,
            end=end_time,
            content=text,
        )
        subtitles.append(subtitle)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(srt.compose(subtitles))


async def process_subtitle_generation(
    job_id: str,
    clip_id: str,
    video_path: str,
    language: Optional[str],
    translate_to: Optional[List[str]],
    user_id: str,
    project_id: Optional[str],
):
    """Process subtitle generation in background"""
    try:
        # Update status to processing
        jobs[job_id] = {"status": "processing", "progress": 10}
        await update_backend_status(job_id, 10, "processing")

        # Download video from S3
        local_video = f"/tmp/video_{uuid.uuid4()}.mp4"
        download_from_s3(video_path, local_video)
        jobs[job_id]["progress"] = 20
        await update_backend_status(job_id, 20, "processing")

        # Extract audio (simplified - in production use ffmpeg-python)
        # For now, assume video_path is actually audio or video with audio
        audio_path = local_video  # TODO: Extract audio track

        # Load Whisper model
        model = get_whisper_model(default_model)
        jobs[job_id]["progress"] = 30
        await update_backend_status(job_id, 30, "processing")

        # Transcribe
        print(f"Transcribing audio: language={language}")
        if use_faster_whisper:
            segments, info = model.transcribe(
                audio_path,
                language=language,
                task="translate" if translate_to else "transcribe",
            )
            detected_language = info.language
            segments_list = [
                {"start": seg.start, "end": seg.end, "text": seg.text}
                for seg in segments
            ]
        else:
            result = model.transcribe(audio_path, language=language)
            detected_language = result["language"]
            segments_list = result["segments"]

        jobs[job_id]["progress"] = 70
        await update_backend_status(job_id, 70, "processing")

        # Generate SRT file
        srt_path = f"/tmp/subtitles_{uuid.uuid4()}.srt"
        generate_srt(segments_list, srt_path)

        # Upload to S3
        s3_key = f"users/{user_id}/projects/{project_id or 'temp'}/metadata/{uuid.uuid4()}.srt"
        s3_path = upload_to_s3(srt_path, s3_key)
        jobs[job_id]["progress"] = 90
        await update_backend_status(job_id, 90, "processing")

        # Handle translations if requested
        translations = {}
        if translate_to:
            # TODO: Implement translation using Whisper or separate translation service
            pass

        # Clean up local files
        if os.path.exists(local_video):
            os.remove(local_video)
        if os.path.exists(srt_path):
            os.remove(srt_path)

        # Prepare output
        output = {
            "filePath": s3_path,
            "language": detected_language,
            "segments": segments_list,
            "modelVersion": f"whisper-{default_model}",
            "translations": translations if translations else None,
        }

        jobs[job_id] = {"status": "completed", "progress": 100, "output": output}
        await update_backend_status(job_id, 100, "completed", output)

    except Exception as e:
        error_msg = str(e)
        print(f"Error in subtitle generation: {error_msg}")
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

    if request.type != "subtitle_generate":
        raise HTTPException(status_code=400, detail=f"Unsupported job type: {request.type}")

    clip_id = request.input.get("clipId")
    video_path = request.input.get("videoPath") or request.input.get("audioPath")

    if not clip_id or not video_path:
        raise HTTPException(
            status_code=400, detail="Missing 'clipId' or 'videoPath'/'audioPath' in input"
        )

    language = request.input.get("language")  # Auto-detect if None
    translate_to = request.input.get("translateTo", [])
    user_id = request.input.get("userId", "unknown")
    project_id = request.input.get("projectId")

    # Start background task
    background_tasks.add_task(
        process_subtitle_generation,
        request.jobId,
        clip_id,
        video_path,
        language,
        translate_to,
        user_id,
        project_id,
    )

    return ExecuteResponse(jobId=request.jobId, status="accepted")


@app.get("/health")
async def health():
    """Health check - worker contract endpoint"""
    gpu_available = torch.cuda.is_available()
    model_loaded = default_model in whisper_models

    return {
        "status": "healthy",
        "gpu_available": gpu_available,
        "model_loaded": model_loaded,
        "device": device,
        "model": default_model,
        "use_faster_whisper": use_faster_whisper,
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {"service": "subtitle-generator-worker", "version": "1.0.0"}

