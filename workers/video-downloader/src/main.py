"""
Video Downloader Worker
Implements worker contract: /execute, /status, /health
Downloads videos from YouTube, Rumble, X/Twitter, TikTok, Instagram using yt-dlp
"""

import os
import uuid
import hashlib
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
import yt_dlp
import boto3
from botocore.exceptions import ClientError

app = FastAPI(title="Video Downloader Worker")

# S3 configuration
S3_ENDPOINT = os.getenv("S3_ENDPOINT")
S3_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = os.getenv("S3_SECRET_ACCESS_KEY")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
BUCKET = os.getenv("S3_BUCKET", "video-ai-platform")
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:3001")
WORKER_API_KEY = os.getenv("WORKER_API_KEY", "")

# Initialize S3 client
if S3_ENDPOINT and S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY:
    s3_client = boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT,
        aws_access_key_id=S3_ACCESS_KEY_ID,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY,
        region_name=S3_REGION,
    )
    print(f"S3 client initialized: endpoint={S3_ENDPOINT}, bucket={BUCKET}")
else:
    print("WARNING: S3 environment variables not set! Uploads will fail.")
    s3_client = None

# In-memory job tracking (in production, use Redis)
jobs = {}


class ExecuteRequest(BaseModel):
    jobId: str
    type: str
    input: dict


class ExecuteResponse(BaseModel):
    jobId: str
    status: str
    message: Optional[str] = None


class StatusUpdate(BaseModel):
    jobId: str
    progress: int
    status: str
    output: Optional[dict] = None
    error: Optional[str] = None


def get_platform_from_url(url: str) -> str:
    """Detect platform from URL"""
    if "youtube.com" in url or "youtu.be" in url:
        return "youtube"
    elif "rumble.com" in url:
        return "rumble"
    elif "twitter.com" in url or "x.com" in url:
        return "twitter"
    elif "tiktok.com" in url:
        return "tiktok"
    elif "instagram.com" in url:
        return "instagram"
    return "unknown"


def upload_to_s3(file_path: str, s3_key: str) -> str:
    """Upload file to S3 and return S3 path"""
    if s3_client is None:
        raise Exception("S3 client not initialized - check environment variables")
    if not os.path.exists(file_path):
        raise Exception(f"File not found: {file_path}")
    try:
        print(f"Uploading {file_path} to s3://{BUCKET}/{s3_key}")
        s3_client.upload_file(file_path, BUCKET, s3_key)
        print(f"Upload successful: s3://{BUCKET}/{s3_key}")
        return f"s3://{BUCKET}/{s3_key}"
    except ClientError as e:
        raise Exception(f"Failed to upload to S3: {e}")


def download_video(url: str, quality: str = "best", format: str = "mp4") -> dict:
    """Download video using yt-dlp"""
    output_dir = "/tmp"
    output_template = f"{output_dir}/%(id)s.%(ext)s"

    # Format selector: prefer single-file mp4, but allow merging if needed (ffmpeg is installed)
    # Format syntax: best single-file mp4 OR best video+audio that can be merged
    format_selector = (
        quality if quality != "best" 
        else "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best"
    )

    ydl_opts = {
        "format": format_selector,
        "outtmpl": output_template,
        "quiet": False,
        "no_warnings": False,
        "noplaylist": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info.get("id", str(uuid.uuid4()))
        ext = info.get("ext", "mp4")
        file_path = f"{output_dir}/{video_id}.{ext}"

        # Get video metadata
        duration = info.get("duration", 0)
        width = info.get("width", 0)
        height = info.get("height", 0)
        title = info.get("title", "Untitled")

        return {
            "file_path": file_path,
            "duration": duration,
            "width": width,
            "height": height,
            "title": title,
            "video_id": video_id,
            "ext": ext,
        }


async def process_download(job_id: str, url: str, quality: str, format: str, user_id: str, project_id: Optional[str]):
    """Process video download in background"""
    try:
        print(f"[Job {job_id}] Starting download: {url}")
        
        # Update status to processing
        jobs[job_id] = {"status": "processing", "progress": 10}
        await update_backend_status(job_id, 10, "processing")

        # Download video
        print(f"[Job {job_id}] Downloading video...")
        video_info = download_video(url, quality, format)
        print(f"[Job {job_id}] Download complete: {video_info['file_path']}")
        jobs[job_id]["progress"] = 50
        await update_backend_status(job_id, 50, "processing")

        # Upload to S3
        platform = get_platform_from_url(url)
        s3_key = f"users/{user_id}/projects/{project_id or 'temp'}/source/{video_info['video_id']}.{video_info['ext']}"
        print(f"[Job {job_id}] Uploading to S3: {s3_key}")
        s3_path = upload_to_s3(video_info["file_path"], s3_key)
        print(f"[Job {job_id}] Upload complete: {s3_path}")

        # Get file size before deleting
        file_size = os.path.getsize(video_info["file_path"]) if os.path.exists(video_info["file_path"]) else 0

        # Generate thumbnail (simplified - in production use ffmpeg)
        thumbnail_path = None  # TODO: Extract thumbnail

        # Clean up local file
        if os.path.exists(video_info["file_path"]):
            os.remove(video_info["file_path"])

        # Prepare output
        output = {
            "filePath": s3_path,
            "duration": video_info["duration"],
            "width": video_info["width"],
            "height": video_info["height"],
            "fileSize": file_size,
            "thumbnailPath": thumbnail_path,
        }

        jobs[job_id] = {"status": "completed", "progress": 100, "output": output}
        await update_backend_status(job_id, 100, "completed", output)
        print(f"[Job {job_id}] Job completed successfully")

    except Exception as e:
        error_msg = str(e)
        import traceback
        print(f"[Job {job_id}] Error: {error_msg}")
        print(f"[Job {job_id}] Traceback: {traceback.format_exc()}")
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
                timeout=10.0,
            )
    except Exception as e:
        print(f"Failed to update backend status: {e}")


@app.post("/execute", response_model=ExecuteResponse)
async def execute(
    request: ExecuteRequest,
    background_tasks: BackgroundTasks,
    x_worker_api_key: Optional[str] = Header(None),
):
    """Execute job - worker contract endpoint"""
    # Handle authentication: if WORKER_API_KEY is set, require it; otherwise allow any value (including None/empty)
    provided_key = x_worker_api_key or ""
    expected_key = WORKER_API_KEY or ""
    if expected_key and provided_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if request.type != "video_download":
        raise HTTPException(status_code=400, detail=f"Unsupported job type: {request.type}")

    url = request.input.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="Missing 'url' in input")

    quality = request.input.get("quality", "best")
    format = request.input.get("format", "mp4")
    user_id = request.input.get("userId", "unknown")
    project_id = request.input.get("projectId")

    # Start background task
    background_tasks.add_task(
        process_download,
        request.jobId,
        url,
        quality,
        format,
        user_id,
        project_id,
    )

    return ExecuteResponse(jobId=request.jobId, status="accepted")


@app.get("/health")
async def health():
    """Health check - worker contract endpoint"""
    return {
        "status": "healthy",
        "gpu_available": False,  # This worker doesn't need GPU
        "model_loaded": True,
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {"service": "video-downloader-worker", "version": "1.0.0"}

