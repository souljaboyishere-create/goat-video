# Video Renderer Worker

Final composition engine - turns timeline + assets → final video.

## Architecture

The renderer is a **deterministic compiler**, not an AI model. It:
- Resolves timeline JSON into frame-level execution plan
- Composes audio from multiple tracks
- Renders subtitles (ASS format)
- Applies face transformations (Phase 2 hook)
- Exports final MP4 with metadata

## Features

- **Timeline Resolution**: Converts declarative timeline to execution plan
- **Audio Composition**: Mixes voice, music, and effects
- **Subtitle Rendering**: Burns in or exports sidecar subtitles
- **Face Transformation Hook**: Ready for Phase 2 face swapping
- **Multi-format Export**: 9:16, 16:9, 1:1
- **Watermark Support**: Optional watermark layer
- **Thumbnail Generation**: Auto-generates preview thumbnails

## Worker Contract

- `POST /execute` - Execute render job
- `GET /health` - Health check (includes FFmpeg availability)

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
  "projectId": "uuid",
  "timeline": { /* Timeline JSON */ },
  "format": "16:9",
  "resolution": "1920x1080",
  "watermark": false
}
```

## Job Output

```json
{
  "filePath": "s3://bucket/path/to/video.mp4",
  "thumbnailPath": "s3://bucket/path/to/thumbnail.jpg",
  "duration": 30.5,
  "fileSize": 15728640,
  "format": "16:9",
  "resolution": "1920x1080",
  "watermark": false
}
```

## Renderer Components

### Timeline Resolver
Converts timeline JSON into frame-by-frame execution plan.

### Audio Composer
Mixes multiple audio tracks (voice, music, effects) with volume control.

### Subtitle Renderer
Renders subtitles as ASS format for FFmpeg burn-in.

### Face Transformer (Phase 2 Hook)
Stub for face transformation. Phase 1: No transformation. Phase 2: Will implement.

### FFmpeg Builder
Builds FFmpeg filter graphs for final composition.

## Critical Design Rule

**Face transformation must NEVER modify source video.**

All transformations are:
- Applied at render time
- Driven by timeline + metadata
- Reversible
- Deterministic

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Run worker
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## FFmpeg Requirements

FFmpeg must be installed in the container. The Dockerfile includes it.

## Performance

- Rendering is CPU/IO intensive
- Can be parallelized across multiple workers
- GPU not required (unless Phase 2 face transformation uses GPU)

## Future Enhancements

- Multi-clip composition with transitions
- Advanced audio effects
- Video filters and color grading
- Hardware acceleration (NVENC, etc.)

