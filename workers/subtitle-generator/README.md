# Subtitle Generator Worker

Speech-to-text and subtitle generation using Whisper (OpenAI) or faster-whisper.

## Features

- **Speech-to-Text**: Transcribe audio/video to text using Whisper
- **Subtitle Generation**: Generate SRT files with timestamps
- **Auto Language Detection**: Automatically detect language if not specified
- **Translation Support**: Optional translation to multiple languages
- **GPU Acceleration**: Supports CUDA for faster processing

## Worker Contract

- `POST /execute` - Execute subtitle generation job
- `GET /health` - Health check (includes GPU status and model loaded status)

## Environment Variables

- `S3_ENDPOINT` - S3 endpoint URL
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `S3_BUCKET` - S3 bucket name
- `S3_REGION` - S3 region
- `BACKEND_API_URL` - Backend API URL for status updates
- `WORKER_API_KEY` - API key for authenticating with backend
- `USE_FASTER_WHISPER` - Use faster-whisper (default: true)
- `WHISPER_MODEL` - Whisper model size (tiny, base, small, medium, large-v2, large-v3)

## Job Input

```json
{
  "clipId": "uuid",
  "videoPath": "s3://bucket/path/to/video.mp4",
  "language": "en",
  "translateTo": ["es", "fr"]
}
```

## Job Output

```json
{
  "filePath": "s3://bucket/path/to/subtitles.srt",
  "language": "en",
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": "Hello, this is a test."
    }
  ],
  "modelVersion": "whisper-base",
  "translations": {
    "es": "s3://bucket/path/to/subtitles.es.srt"
  }
}
```

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Run worker
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## GPU Support

For GPU acceleration, use NVIDIA CUDA base image:

```dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04
# ... rest of Dockerfile
```

Then install PyTorch with CUDA:
```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Model Selection

- **tiny**: Fastest, lowest accuracy
- **base**: Good balance (default)
- **small**: Better accuracy
- **medium**: High accuracy
- **large-v2**: Best accuracy
- **large-v3**: Latest, best accuracy

Larger models require more GPU memory and processing time.

