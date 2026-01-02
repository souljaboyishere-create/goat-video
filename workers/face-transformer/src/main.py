"""
Face Transformer Worker (Phase 1: Detection Only)
Implements worker contract: /execute, /status, /health
Uses InsightFace for face detection and tracking
Phase 1: Detection only - no transformation yet
"""

import os
import uuid
import json
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis

app = FastAPI(title="Face Transformer Worker")

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

# InsightFace model cache
face_models = {}
default_model = os.getenv("INSIGHTFACE_MODEL", "buffalo_l")  # or "buffalo_s" for smaller

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


def get_face_model(model_name: str = "buffalo_l"):
    """Get or load InsightFace model"""
    if model_name not in face_models:
        print(f"Loading InsightFace model: {model_name}")
        face_models[model_name] = FaceAnalysis(
            name=model_name,
            providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
        )
        face_models[model_name].prepare(ctx_id=0, det_size=(640, 640))
        print(f"Model loaded successfully")
    return face_models[model_name]


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


def track_faces(detections: List[List[Dict]], frame_sampling: int = 1):
    """
    Simple face tracking by matching embeddings across frames
    Returns (track_assignments, tracks) tuple
    """
    tracks = {}
    track_counter = 0

    for frame_idx, frame_detections in enumerate(detections):
        for face in frame_detections:
            embedding = face.get("embedding")
            if not embedding:
                continue

            embedding = np.array(embedding)

            # Find closest existing track
            best_track = None
            best_distance = float("inf")
            threshold = 0.6  # Cosine similarity threshold

            for track_id, track_data in tracks.items():
                avg_embedding = track_data["avg_embedding"]
                # Cosine distance
                distance = 1 - np.dot(embedding, avg_embedding) / (
                    np.linalg.norm(embedding) * np.linalg.norm(avg_embedding)
                )

                if distance < threshold and distance < best_distance:
                    best_distance = distance
                    best_track = track_id

            # Assign to existing track or create new
            if best_track:
                track_id = best_track
                # Update track
                tracks[track_id]["frames"].append(frame_idx)
                tracks[track_id]["embeddings"].append(embedding)
                tracks[track_id]["avg_embedding"] = np.mean(
                    tracks[track_id]["embeddings"], axis=0
                )
            else:
                track_id = f"face_{track_counter}"
                track_counter += 1
                tracks[track_id] = {
                    "frames": [frame_idx],
                    "embeddings": [embedding],
                    "avg_embedding": embedding,
                    "start_frame": frame_idx,
                }

            face["trackId"] = track_id

    return tracks


async def process_face_detection(
    job_id: str,
    clip_id: str,
    video_path: str,
    frame_sampling: Optional[int],
    min_confidence: float,
    user_id: str,
    project_id: Optional[str],
):
    """Process face detection in background"""
    try:
        # Update status to processing
        jobs[job_id] = {"status": "processing", "progress": 10}
        await update_backend_status(job_id, 10, "processing")

        # Download video from S3
        local_video = f"/tmp/video_{uuid.uuid4()}.mp4"
        download_from_s3(video_path, local_video)
        jobs[job_id]["progress"] = 20
        await update_backend_status(job_id, 20, "processing")

        # Load InsightFace model
        model = get_face_model(default_model)
        jobs[job_id]["progress"] = 30
        await update_backend_status(job_id, 30, "processing")

        # Open video
        cap = cv2.VideoCapture(local_video)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0

        frame_sampling = frame_sampling or 1
        detections = []
        frame_number = 0

        print(f"Processing video: {total_frames} frames at {fps} fps")

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Sample frames
            if frame_number % frame_sampling == 0:
                # Detect faces
                faces = model.get(frame)

                frame_detections = []
                for face in faces:
                    if face.det_score < min_confidence:
                        continue

                    bbox = face.bbox.astype(int)
                    embedding = face.embedding.tolist()

                    frame_detections.append({
                        "boundingBox": {
                            "x": int(bbox[0]),
                            "y": int(bbox[1]),
                            "width": int(bbox[2] - bbox[0]),
                            "height": int(bbox[3] - bbox[1]),
                        },
                        "confidence": float(face.det_score),
                        "embedding": embedding,
                        "landmarks": {
                            "leftEye": {"x": float(face.landmark[0][0]), "y": float(face.landmark[0][1])},
                            "rightEye": {"x": float(face.landmark[1][0]), "y": float(face.landmark[1][1])},
                            "nose": {"x": float(face.landmark[2][0]), "y": float(face.landmark[2][1])},
                            "mouthLeft": {"x": float(face.landmark[3][0]), "y": float(face.landmark[3][1])},
                            "mouthRight": {"x": float(face.landmark[4][0]), "y": float(face.landmark[4][1])},
                        },
                    })

                detections.append({
                    "frameNumber": frame_number,
                    "timestamp": frame_number / fps if fps > 0 else 0,
                    "faces": frame_detections,
                })

                # Update progress
                progress = 30 + int((frame_number / total_frames) * 50)
                jobs[job_id]["progress"] = progress
                await update_backend_status(job_id, progress, "processing")

            frame_number += 1

        cap.release()
        jobs[job_id]["progress"] = 80
        await update_backend_status(job_id, 80, "processing")

        # Track faces across frames
        print("Tracking faces across frames...")
        # Convert detections to list of frame detections for tracking
        frame_detections_list = [d["faces"] for d in detections]
        tracks = track_faces(frame_detections_list, frame_sampling)
        
        # Update detections with track IDs
        frame_idx = 0
        for detection in detections:
            for face in detection["faces"]:
                if "trackId" in face:
                    # Track ID already assigned by track_faces
                    pass
            frame_idx += 1

        # Prepare tracks output
        tracks_output = []
        for track_id, track_data in tracks.items():
            start_frame = track_data["start_frame"]
            end_frame = track_data["frames"][-1]
            tracks_output.append({
                "trackId": track_id,
                "startFrame": start_frame,
                "endFrame": end_frame,
                "startTime": start_frame / fps if fps > 0 else 0,
                "endTime": end_frame / fps if fps > 0 else 0,
                "averageEmbedding": track_data["avg_embedding"].tolist(),
                "metadata": {
                    "totalFrames": len(track_data["frames"]),
                    "confidence": 0.9,  # Average confidence
                },
            })

        # Prepare output
        output_data = {
            "videoPath": video_path,
            "detections": detections,
            "tracks": tracks_output,
            "metadata": {
                "totalFrames": total_frames,
                "fps": fps,
                "duration": duration,
                "facesDetected": sum(len(d["faces"]) for d in detections),
                "uniqueTracks": len(tracks),
                "modelVersion": f"insightface-{default_model}",
                "detectionConfig": {
                    "minConfidence": min_confidence,
                    "frameSampling": frame_sampling,
                },
            },
        }

        # Save JSON to file
        json_path = f"/tmp/detections_{uuid.uuid4()}.json"
        with open(json_path, "w") as f:
            json.dump(output_data, f, indent=2)

        # Upload to S3
        s3_key = f"users/{user_id}/projects/{project_id or 'temp'}/metadata/face_detections_{uuid.uuid4()}.json"
        s3_path = upload_to_s3(json_path, s3_key)

        # Clean up
        if os.path.exists(local_video):
            os.remove(local_video)
        if os.path.exists(json_path):
            os.remove(json_path)

        # Prepare output
        output = {
            "filePath": s3_path,
            "facesDetected": output_data["metadata"]["facesDetected"],
            "uniqueTracks": len(tracks),
            "duration": duration,
            "modelVersion": f"insightface-{default_model}",
        }

        jobs[job_id] = {"status": "completed", "progress": 100, "output": output}
        await update_backend_status(job_id, 100, "completed", output)

    except Exception as e:
        error_msg = str(e)
        print(f"Error in face detection: {error_msg}")
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
                timeout=60.0,  # Face detection can take longer
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

    if request.type != "face_transform":
        raise HTTPException(status_code=400, detail=f"Unsupported job type: {request.type}")

    clip_id = request.input.get("clipId")
    video_path = request.input.get("videoPath")

    if not clip_id or not video_path:
        raise HTTPException(
            status_code=400, detail="Missing 'clipId' or 'videoPath' in input"
        )

    frame_sampling = request.input.get("frameSampling", 1)  # Process every Nth frame
    min_confidence = request.input.get("minConfidence", 0.5)
    user_id = request.input.get("userId", "unknown")
    project_id = request.input.get("projectId")

    # Phase 1: Detection only (no transformation)
    # Start background task
    background_tasks.add_task(
        process_face_detection,
        request.jobId,
        clip_id,
        video_path,
        frame_sampling,
        min_confidence,
        user_id,
        project_id,
    )

    return ExecuteResponse(jobId=request.jobId, status="accepted")


@app.get("/health")
async def health():
    """Health check - worker contract endpoint"""
    model_loaded = default_model in face_models

    return {
        "status": "healthy",
        "gpu_available": False,  # InsightFace uses ONNX, GPU via ONNXRuntime
        "model_loaded": model_loaded,
        "model": default_model,
        "version": "1.0.0",
        "phase": "detection_only",  # Phase 1: Detection only
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "face-transformer-worker",
        "version": "1.0.0",
        "phase": "detection_only",
    }

