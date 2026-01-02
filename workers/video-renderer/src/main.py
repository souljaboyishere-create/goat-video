"""
Video Renderer Worker
Final composition engine - turns timeline + assets → final video
Implements worker contract: /execute, /status, /health
"""

import os
import uuid
import json
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
import ffmpeg
import tempfile

# Import renderer components
from timeline_resolver import TimelineResolver
from audio_composer import AudioComposer
from subtitle_renderer import SubtitleRenderer
from face_transformer import FaceTransformer
from ffmpeg_builder import FFmpegBuilder

app = FastAPI(title="Video Renderer Worker")

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


async def process_render(
    job_id: str,
    project_id: str,
    timeline: dict,
    format: str,
    resolution: Optional[str],
    watermark: bool,
    user_id: str,
):
    """Process video rendering in background"""
    try:
        # Update status to processing
        jobs[job_id] = {"status": "processing", "progress": 10}
        await update_backend_status(job_id, 10, "processing")

        # Resolve timeline
        timeline_settings = timeline.get("settings", {})
        fps = timeline_settings.get("fps", 30.0)
        
        resolver = TimelineResolver(timeline, fps=fps)
        resolved_frames = resolver.resolve()
        dependencies = resolver.get_asset_dependencies()
        
        jobs[job_id]["progress"] = 20
        await update_backend_status(job_id, 20, "processing")

        # Download assets
        # TODO: Download videos, audio, subtitles from S3 based on dependencies
        # For now, assume first video clip is the main video
        main_video_path = None
        if dependencies["videos"]:
            # Get video path from clip
            # TODO: Resolve from database
            pass

        jobs[job_id]["progress"] = 30
        await update_backend_status(job_id, 30, "processing")

        # Compose audio
        audio_clips = []
        for frame in resolved_frames:
            audio_clips.extend(frame.audio_clips)
        
        temp_dir = tempfile.gettempdir()
        audio_output = os.path.join(temp_dir, f"audio_{uuid.uuid4()}.aac")
        composer = AudioComposer(audio_clips, audio_output)
        composed_audio = composer.compose()
        
        jobs[job_id]["progress"] = 50
        await update_backend_status(job_id, 50, "processing")

        # Render subtitles
        subtitle_clips = []
        for frame in resolved_frames:
            subtitle_clips.extend(frame.subtitles)
        
        subtitle_output = None
        if subtitle_clips:
            subtitle_path = os.path.join(temp_dir, f"subtitles_{uuid.uuid4()}.ass")
            renderer = SubtitleRenderer(subtitle_clips, subtitle_path)
            subtitle_output = renderer.render_ass()
        
        jobs[job_id]["progress"] = 70
        await update_backend_status(job_id, 70, "processing")

        # Determine resolution
        if not resolution:
            if format == "16:9":
                resolution = (1920, 1080)
            elif format == "9:16":
                resolution = (1080, 1920)
            else:  # 1:1
                resolution = (1080, 1080)
        else:
            # Parse "1920x1080" format
            w, h = map(int, resolution.split("x"))
            resolution = (w, h)

        # Build FFmpeg command
        video_output = os.path.join(temp_dir, f"output_{uuid.uuid4()}.mp4")
        
        # For now, use first video clip
        # TODO: Handle multi-clip composition
        if not main_video_path:
            raise ValueError("No video clips found in timeline")
        
        builder = FFmpegBuilder(
            video_clips=[main_video_path],
            audio_path=composed_audio,
            subtitle_path=subtitle_output,
            output_path=video_output,
            resolution=resolution,
            fps=fps,
            format=format,
        )
        
        stream = builder.build()
        
        # Run FFmpeg
        ffmpeg.run(stream, overwrite_output=True, quiet=True)
        
        jobs[job_id]["progress"] = 90
        await update_backend_status(job_id, 90, "processing")

        # Generate thumbnail
        thumbnail_path = os.path.join(temp_dir, f"thumb_{uuid.uuid4()}.jpg")
        (
            ffmpeg
            .input(video_output, ss=1)  # Frame at 1 second
            .output(thumbnail_path, vframes=1, qscale=2)
            .overwrite_output()
            .run(quiet=True)
        )

        # Upload to S3
        video_s3_key = f"users/{user_id}/projects/{project_id}/renders/{uuid.uuid4()}.mp4"
        video_s3_path = upload_to_s3(video_output, video_s3_key)
        
        thumbnail_s3_key = f"users/{user_id}/projects/{project_id}/thumbnails/{uuid.uuid4()}.jpg"
        thumbnail_s3_path = upload_to_s3(thumbnail_path, thumbnail_s3_key)

        # Get file size and duration
        import subprocess
        probe = ffmpeg.probe(video_output)
        duration = float(probe["format"]["duration"])
        file_size = int(probe["format"]["size"])

        # Clean up
        for path in [video_output, composed_audio, thumbnail_path]:
            if path and os.path.exists(path):
                os.remove(path)
        if subtitle_output and os.path.exists(subtitle_output):
            os.remove(subtitle_output)

        # Prepare output
        output = {
            "filePath": video_s3_path,
            "thumbnailPath": thumbnail_s3_path,
            "duration": duration,
            "fileSize": file_size,
            "format": format,
            "resolution": f"{resolution[0]}x{resolution[1]}",
            "watermark": watermark,
        }

        jobs[job_id] = {"status": "completed", "progress": 100, "output": output}
        await update_backend_status(job_id, 100, "completed", output)

    except Exception as e:
        error_msg = str(e)
        print(f"Error in render: {error_msg}")
        import traceback
        traceback.print_exc()
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
                timeout=300.0,  # Rendering can take a while
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

    if request.type != "render":
        raise HTTPException(status_code=400, detail=f"Unsupported job type: {request.type}")

    project_id = request.input.get("projectId")
    timeline = request.input.get("timeline")
    format = request.input.get("format", "16:9")
    resolution = request.input.get("resolution")
    watermark = request.input.get("watermark", False)

    if not project_id or not timeline:
        raise HTTPException(
            status_code=400, detail="Missing 'projectId' or 'timeline' in input"
        )

    user_id = request.input.get("userId", "unknown")

    # Start background task
    background_tasks.add_task(
        process_render,
        request.jobId,
        project_id,
        timeline,
        format,
        resolution,
        watermark,
        user_id,
    )

    return ExecuteResponse(jobId=request.jobId, status="accepted")


@app.get("/health")
async def health():
    """Health check - worker contract endpoint"""
    # Check FFmpeg availability
    try:
        ffmpeg.probe("anullsrc", format="lavfi")
        ffmpeg_available = True
    except:
        ffmpeg_available = False

    return {
        "status": "healthy" if ffmpeg_available else "unhealthy",
        "ffmpeg_available": ffmpeg_available,
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {"service": "video-renderer-worker", "version": "1.0.0"}

