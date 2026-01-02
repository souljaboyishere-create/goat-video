# Face Transformer Worker (Phase 1: Detection Only)

Face detection and tracking using InsightFace. **Phase 1 focuses on detection only** - no face transformation yet.

## Features

- **Face Detection**: Detect faces in video frames using InsightFace
- **Face Tracking**: Track faces across frames with persistent IDs
- **Face Embeddings**: Extract embeddings for identity matching
- **Bounding Boxes**: Per-frame bounding box coordinates
- **Landmarks**: Facial landmarks (eyes, nose, mouth)
- **Metadata Export**: JSON output with all detection data

## Phase 1 Scope

This worker currently:
- ✅ Detects faces in video
- ✅ Tracks faces across frames
- ✅ Extracts embeddings
- ✅ Exports metadata

This worker does NOT yet:
- ❌ Transform faces
- ❌ Swap faces
- ❌ Apply character appearances

**Phase 2** will add transformation capabilities.

## Worker Contract

- `POST /execute` - Execute face detection job
- `GET /health` - Health check

## Environment Variables

- `S3_ENDPOINT` - S3 endpoint URL
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `S3_BUCKET` - S3 bucket name
- `S3_REGION` - S3 region
- `BACKEND_API_URL` - Backend API URL for status updates
- `WORKER_API_KEY` - API key for authenticating with backend
- `INSIGHTFACE_MODEL` - Model name (buffalo_l or buffalo_s)

## Job Input

```json
{
  "clipId": "uuid",
  "videoPath": "s3://bucket/path/to/video.mp4",
  "frameSampling": 1,
  "minConfidence": 0.5
}
```

## Job Output

```json
{
  "filePath": "s3://bucket/path/to/detections.json",
  "facesDetected": 150,
  "uniqueTracks": 3,
  "duration": 30.5,
  "modelVersion": "insightface-buffalo_l"
}
```

The JSON file contains:
- Per-frame detections with bounding boxes
- Face tracks with persistent IDs
- Face embeddings for identity matching
- Metadata (FPS, duration, etc.)

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Run worker
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## Model Selection

- **buffalo_l**: Larger model, better accuracy (default)
- **buffalo_s**: Smaller model, faster processing

Models are downloaded automatically on first use.

## GPU Support

InsightFace uses ONNX Runtime, which supports GPU via CUDA. For GPU acceleration, install ONNX Runtime with CUDA support:

```bash
pip install onnxruntime-gpu
```

## Next Phase

Phase 2 will add:
- Face swapping
- Character appearance application
- Historical character transformation

