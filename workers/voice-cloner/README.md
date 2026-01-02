# Voice Cloner Worker

Voice cloning and text-to-speech using Coqui TTS (XTTS v2).

## Features

- **Voice Cloning**: Clone voices from reference audio using XTTS v2
- **Multilingual**: Supports 16+ languages
- **Voice Embeddings**: Extract and reuse voice profiles
- **Emotion/Style**: Support for emotion and style parameters (model-dependent)

## Worker Contract

- `POST /execute` - Execute voice cloning job
- `GET /health` - Health check (includes GPU status and model loaded status)

## Environment Variables

- `S3_ENDPOINT` - S3 endpoint URL
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `S3_BUCKET` - S3 bucket name
- `S3_REGION` - S3 region
- `BACKEND_API_URL` - Backend API URL for status updates
- `WORKER_API_KEY` - API key for authenticating with backend

## Job Input

```json
{
  "sourceAudio": "s3://bucket/path/to/reference.wav",
  "text": "Hello, this is a test of voice cloning.",
  "language": "en",
  "emotion": "happy",
  "style": "narrative"
}
```

## Job Output

```json
{
  "filePath": "s3://bucket/path/to/output.wav",
  "duration": 5.2,
  "modelVersion": "xtts-v2",
  "sampleRate": 24000,
  "voiceEmbedding": [0.1, 0.2, ...] // Optional
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

## Model Loading

The worker uses XTTS v2 by default, which supports:
- Multilingual voice cloning (16 languages)
- High-quality synthesis
- Fast inference

Models are cached in memory after first load to avoid reloading.

## Integration with Coqui TTS

This worker uses the Coqui TTS library from the `TTS` folder. The TTS models will be downloaded automatically on first use.

