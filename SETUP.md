# Setup Guide

## What's Been Created

### ✅ Complete System

1. **Prisma Schema** (`apps/api/prisma/schema.prisma`)
   - All core models: User, Project, Clip, Scene, Character, Voice, Job, Render
   - Voice persistence with embeddings
   - Character persistence with face embeddings
   - Relationships and indexes configured

2. **Timeline JSON Format** (`shared/types/timeline.ts`)
   - Complete TypeScript types for timeline structure
   - Voice track support (voiceId, voiceText, voiceLanguage)
   - Face/Character binding (characterId, faceTrackId)
   - Pure data format for undo/redo, versioning

3. **Backend Scaffold** (`apps/api/`)
   - Fastify server with TypeScript
   - Authentication (register, login, JWT)
   - Project CRUD endpoints
   - Job CRUD endpoints with BullMQ integration
   - Voice CRUD endpoints
   - Character CRUD endpoints
   - WebSocket support for real-time updates
   - Worker processor for dispatching jobs to workers
   - Prisma client integration

4. **Frontend Scaffold** (`apps/web/`)
   - Next.js 14 with App Router
   - Video editor page with timeline and preview
   - Job status bar with WebSocket updates
   - TypeScript types from shared folder

5. **Workers**
   - **Video Downloader** (`workers/video-downloader/`) - Downloads from YouTube, Rumble, X/Twitter, TikTok, Instagram
   - **Voice Cloner** (`workers/voice-cloner/`) - Coqui TTS voice cloning and TTS
   - **Subtitle Generator** (`workers/subtitle-generator/`) - Whisper speech-to-text and subtitle generation
   - **Face Transformer** (`workers/face-transformer/`) - Phase 1: InsightFace detection and tracking

## Next Steps

### 1. Install Dependencies

```bash
# Root
cd /Users/cameronentezarian/Documents/video-ai-platform
pnpm install

# Backend
cd apps/api
pnpm install
pnpm prisma:generate

# Frontend
cd apps/web
pnpm install

# Workers
cd workers/video-downloader
pip install -r requirements.txt

cd ../voice-cloner
pip install -r requirements.txt

cd ../subtitle-generator
pip install -r requirements.txt

cd ../face-transformer
pip install -r requirements.txt
```

### 2. Setup Database

```bash
cd apps/api

# Create .env file
cp ../../.env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
pnpm prisma:migrate dev --name init
```

### 3. Setup Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7

# Or install locally
brew install redis
redis-server
```

### 4. Setup S3 (MinIO for local dev)

```bash
# Using Docker
docker run -d -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Create bucket
# Visit http://localhost:9001 and create bucket "video-ai-platform"
```

### 5. Run Services

```bash
# Terminal 1: Backend
cd apps/api
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev

# Terminal 3: Video Downloader Worker
cd workers/video-downloader
uvicorn src.main:app --host 0.0.0.0 --port 8000

# Terminal 4: Voice Cloner Worker
cd workers/voice-cloner
uvicorn src.main:app --host 0.0.0.0 --port 8001

# Terminal 5: Subtitle Generator Worker
cd workers/subtitle-generator
uvicorn src.main:app --host 0.0.0.0 --port 8005

# Terminal 6: Face Transformer Worker
cd workers/face-transformer
uvicorn src.main:app --host 0.0.0.0 --port 8003
```

### 6. Test the System

1. Register a user: `POST http://localhost:3001/api/auth/register`
2. Create a project: `POST http://localhost:3001/api/projects`
3. Create a download job: `POST http://localhost:3001/api/jobs` with type `video_download`
4. Create a voice clone job: `POST http://localhost:3001/api/jobs` with type `voice_clone`
5. Create a subtitle job: `POST http://localhost:3001/api/jobs` with type `subtitle_generate`
6. Create a face detection job: `POST http://localhost:3001/api/jobs` with type `face_transform`
7. Watch job progress via WebSocket or polling

## Architecture Notes

- **Backend**: Fastify on port 3001
- **Frontend**: Next.js on port 3000
- **Video Downloader Worker**: FastAPI on port 8000
- **Voice Cloner Worker**: FastAPI on port 8001
- **Subtitle Generator Worker**: FastAPI on port 8005
- **Face Transformer Worker**: FastAPI on port 8003
- **Database**: PostgreSQL (configure in .env)
- **Queue**: Redis (BullMQ)
- **Storage**: S3-compatible (MinIO for local)

## Worker Contract

All workers must implement:
- `POST /execute` - Accept job execution
- `GET /health` - Health check
- Status updates via `POST /api/jobs/:id/status` to backend

## Storage Convention

```
s3://bucket/
  users/{userId}/
    projects/{projectId}/
      source/          # Original videos
      clips/           # Edited clips
      audio/           # Voice clones
      renders/         # Final videos
      thumbnails/      # Thumbnails
      metadata/        # JSON files (subtitles, face detections)
```

## Face Detection (Phase 1)

The face transformer worker currently:
- ✅ Detects faces in video frames
- ✅ Tracks faces across frames with persistent IDs
- ✅ Extracts face embeddings
- ✅ Exports metadata JSON

Phase 2 will add:
- Face transformation
- Character appearance application
- Historical character transformation

## Troubleshooting

- **Prisma errors**: Run `pnpm prisma:generate` in `apps/api`
- **WebSocket not connecting**: Check JWT token in localStorage
- **Worker not receiving jobs**: Check BullMQ queue and worker API key
- **S3 upload fails**: Verify MinIO is running and bucket exists
- **TTS model not loading**: Check internet connection (first load downloads model)
- **Whisper model not loading**: Models download on first use
- **InsightFace errors**: Ensure OpenCV dependencies are installed
