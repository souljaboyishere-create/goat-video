# Testing Guide

Complete guide for testing the AI Video Creation Platform end-to-end.

## Quick Start

**Fastest way to test:**

```bash
# 1. Start infrastructure
./scripts/start-infrastructure.sh

# 2. Setup backend (one time)
cd apps/api
pnpm install
pnpm prisma:generate
pnpm prisma:migrate dev --name init

# 3. Start backend
pnpm dev

# 4. In another terminal, start frontend
cd apps/web
pnpm install
pnpm dev

# 5. In another terminal, start video downloader worker
cd workers/video-downloader
pip install -r requirements.txt
export S3_ENDPOINT=http://localhost:9000 S3_ACCESS_KEY_ID=minioadmin S3_SECRET_ACCESS_KEY=minioadmin S3_BUCKET=video-ai-platform BACKEND_API_URL=http://localhost:3001 WORKER_API_KEY=test-worker-key-123
uvicorn src.main:app --host 0.0.0.0 --port 8000

# 6. Run E2E test
./test-e2e.sh
```

See `QUICK_START.md` for detailed setup instructions.

---

## Prerequisites

### 1. Install Dependencies

```bash
# Navigate to project root
cd /Users/cameronentezarian/Documents/video-ai-platform

# Install root dependencies
pnpm install

# Backend
cd apps/api
pnpm install
pnpm prisma:generate

# Frontend
cd ../web
pnpm install

# Workers (install Python dependencies)
cd ../../workers/video-downloader
pip install -r requirements.txt

cd ../voice-cloner
pip install -r requirements.txt

cd ../subtitle-generator
pip install -r requirements.txt

cd ../face-transformer
pip install -r requirements.txt

cd ../video-renderer
pip install -r requirements.txt
```

### 2. Setup Infrastructure Services

#### Option A: Docker Compose (Recommended)

```bash
cd /Users/cameronentezarian/Documents/video-ai-platform
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- MinIO on ports 9000 (API) and 9001 (Console)

**Create MinIO bucket:**
1. Visit http://localhost:9001
2. Login: `minioadmin` / `minioadmin`
3. Create bucket: `video-ai-platform`

#### Option B: Manual Setup

See `SETUP.md` for manual installation instructions.

### 3. Configure Environment

```bash
# Backend .env
cd apps/api
cp ../../.env.example .env

# Edit .env with:
DATABASE_URL="postgresql://videoai:videoai123@localhost:5432/video_ai_platform"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-change-in-production"
WORKER_API_KEY="test-worker-key-123"
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_BUCKET="video-ai-platform"
S3_REGION="us-east-1"
API_PORT=3001
```

```bash
# Frontend .env.local
cd apps/web
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

### 4. Initialize Database

```bash
cd apps/api
pnpm prisma:migrate dev --name init
```

---

## Starting Services

### Check Service Health

```bash
./scripts/check-services.sh
```

### Start Infrastructure

```bash
./scripts/start-infrastructure.sh
```

### Start Application Services

Open multiple terminal windows:

#### Terminal 1: Backend API
```bash
cd apps/api
pnpm dev
```
**Expected:** Server listening on http://0.0.0.0:3001

#### Terminal 2: Frontend
```bash
cd apps/web
pnpm dev
```
**Expected:** Server running on http://localhost:3000

#### Terminal 3: Video Downloader Worker
```bash
cd workers/video-downloader
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_BUCKET=video-ai-platform
export BACKEND_API_URL=http://localhost:3001
export WORKER_API_KEY=test-worker-key-123
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

#### Terminal 4: Voice Cloner Worker
```bash
cd workers/voice-cloner
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_BUCKET=video-ai-platform
export BACKEND_API_URL=http://localhost:3001
export WORKER_API_KEY=test-worker-key-123
uvicorn src.main:app --host 0.0.0.0 --port 8001
```

#### Terminal 5: Subtitle Generator Worker
```bash
cd workers/subtitle-generator
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_BUCKET=video-ai-platform
export BACKEND_API_URL=http://localhost:3001
export WORKER_API_KEY=test-worker-key-123
uvicorn src.main:app --host 0.0.0.0 --port 8005
```

#### Terminal 6: Face Transformer Worker
```bash
cd workers/face-transformer
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_BUCKET=video-ai-platform
export BACKEND_API_URL=http://localhost:3001
export WORKER_API_KEY=test-worker-key-123
uvicorn src.main:app --host 0.0.0.0 --port 8003
```

#### Terminal 7: Video Renderer Worker
```bash
cd workers/video-renderer
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_BUCKET=video-ai-platform
export BACKEND_API_URL=http://localhost:3001
export WORKER_API_KEY=test-worker-key-123
uvicorn src.main:app --host 0.0.0.0 --port 8007
```

---

## Testing Workflow

### Step 1: Health Checks

```bash
# Backend
curl http://localhost:3001/health

# Workers
curl http://localhost:8000/health  # Video Downloader
curl http://localhost:8001/health  # Voice Cloner
curl http://localhost:8005/health  # Subtitle Generator
curl http://localhost:8003/health  # Face Transformer
curl http://localhost:8007/health  # Video Renderer
```

**Expected:** All return `{"status": "healthy"}` or similar

### Step 2: User Registration & Authentication

```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'

# Save the token from response
export TOKEN="your-jwt-token-here"

# Login (alternative)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'

# Get current user
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** User created, token returned, user info retrieved

### Step 3: Create Project

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "My first video project",
    "format": "16:9"
  }'

# Save project ID
export PROJECT_ID="project-uuid-here"

# Get project
curl http://localhost:3001/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Project created with default timeline structure

### Step 4: Test Video Download

```bash
# Create download job
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "type": "video_download",
    "input": {
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "quality": "best"
    }
  }'

# Save job ID
export JOB_ID="job-uuid-here"

# Check job status
curl http://localhost:3001/api/jobs/$JOB_ID \
  -H "Authorization: Bearer $TOKEN"

# Watch progress (poll every 2 seconds)
watch -n 2 'curl -s http://localhost:3001/api/jobs/'$JOB_ID' -H "Authorization: Bearer '$TOKEN'" | jq .progress'
```

**Expected:** Job progresses from 0% → 100%, video downloaded to S3

### Step 5: Test Voice Cloning

**First, upload a reference audio file to S3 (or use downloaded video audio):**

```bash
# Create voice clone job
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "type": "voice_clone",
    "input": {
      "sourceAudio": "s3://video-ai-platform/users/.../reference.wav",
      "text": "Hello, this is a test of voice cloning technology.",
      "language": "en"
    }
  }'

# Check status
curl http://localhost:3001/api/jobs/$VOICE_JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Voice cloned, audio file generated in S3

### Step 6: Test Subtitle Generation

```bash
# Create subtitle job
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "type": "subtitle_generate",
    "input": {
      "clipId": "clip-uuid-here",
      "videoPath": "s3://video-ai-platform/.../video.mp4",
      "language": "en"
    }
  }'

# Check status
curl http://localhost:3001/api/jobs/$SUBTITLE_JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Subtitles generated, SRT file in S3

### Step 7: Test Face Detection

```bash
# Create face detection job
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "type": "face_transform",
    "input": {
      "clipId": "clip-uuid-here",
      "videoPath": "s3://video-ai-platform/.../video.mp4",
      "frameSampling": 5,
      "minConfidence": 0.5
    }
  }'

# Check status
curl http://localhost:3001/api/jobs/$FACE_JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Faces detected, metadata JSON in S3 with tracks and embeddings

### Step 8: Test Video Rendering

**First, update project timeline with clips, voice, subtitles:**

```bash
# Get project
PROJECT=$(curl -s http://localhost:3001/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN")

# Update timeline (add clips, voice tracks, subtitles)
# This is complex - see timeline structure in shared/types/timeline.ts

# Create render job
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "type": "render",
    "input": {
      "projectId": "'$PROJECT_ID'",
      "timeline": { /* timeline JSON */ },
      "format": "16:9",
      "resolution": "1920x1080",
      "watermark": false
    }
  }'

# Check status (rendering takes longer)
curl http://localhost:3001/api/jobs/$RENDER_JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Final video rendered with all assets composed

---

## End-to-End Test Script

Run the automated E2E test:

```bash
./test-e2e.sh
```

This script:
1. Registers a test user
2. Creates a project
3. Creates a video download job
4. Waits for completion
5. Shows summary

---

## Frontend Testing

### 1. Open Browser

Visit: http://localhost:3000

### 2. Register/Login

- Click "Register" or use API to create account
- Login with credentials

### 3. Create Project

- Click "New Project"
- Fill in name, select format
- Project created with empty timeline

### 4. Add Video

- In project editor, add video URL
- Job created, progress shown in status bar
- Video appears in timeline when complete

### 5. Add Voice

- Select clip in timeline
- Choose voice from library (or create new)
- Enter text to synthesize
- Voice generation job starts
- Audio appears in timeline when complete

### 6. Generate Subtitles

- Select clip or scene
- Click "Generate Subtitles"
- Subtitle job starts
- Subtitles appear when complete

### 7. Render Final Video

- Click "Export" or "Render"
- Select format (9:16, 16:9, 1:1)
- Render job starts
- Download final video when complete

---

## WebSocket Testing

### Connect to WebSocket

```javascript
// In browser console or test script
const token = "your-jwt-token";
const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);

ws.onopen = () => console.log("Connected");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Job update:", data);
};

// Job updates will stream automatically
```

---

## Troubleshooting

### Backend won't start

```bash
# Check database connection
psql postgresql://videoai:videoai123@localhost:5432/video_ai_platform

# Check Redis
redis-cli ping  # Should return PONG

# Check Prisma
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate status
```

### Workers not receiving jobs

```bash
# Check worker endpoints
curl http://localhost:8000/health
curl http://localhost:8001/health

# Check backend worker processor logs
# Should see "Dispatching job X to http://..."

# Verify WORKER_API_KEY matches in backend and workers
```

### S3 uploads failing

```bash
# Check MinIO is running
docker ps | grep minio

# Check bucket exists
# Visit http://localhost:9001

# Test S3 connection
aws --endpoint-url=http://localhost:9000 s3 ls s3://video-ai-platform/
```

### Jobs stuck in "queued"

```bash
# Check Redis queue
redis-cli
> KEYS bull:video-ai-jobs:*
> GET bull:video-ai-jobs:wait

# Check worker processor is running
# Backend logs should show worker processor started
```

### TTS/Whisper models not loading

```bash
# First load downloads models (can take time)
# Check internet connection
# Check disk space (models are large)

# Voice cloner: XTTS v2 ~2GB
# Whisper: base model ~150MB, large-v3 ~3GB
```

### FFmpeg errors in renderer

```bash
# Check FFmpeg installed
ffmpeg -version

# Check video codecs
ffmpeg -codecs | grep h264

# Test FFmpeg with simple command
ffmpeg -f lavfi -i testsrc=duration=1:size=320x240:rate=1 test.mp4
```

---

## Performance Testing

### Load Test (Simple)

```bash
# Install Apache Bench
brew install httpd

# Test API endpoint
ab -n 100 -c 10 http://localhost:3001/health

# Test job creation
ab -n 50 -c 5 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -p job.json \
  http://localhost:3001/api/jobs
```

### Concurrent Jobs

```bash
# Create multiple jobs simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/jobs \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\":\"video_download\",
      \"input\":{\"url\":\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"}
    }" &
done
wait

# Check all jobs processed
curl http://localhost:3001/api/jobs/project/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Test Checklist

- [ ] All services start without errors
- [ ] Health checks pass
- [ ] User registration/login works
- [ ] Project CRUD works
- [ ] Video download job completes
- [ ] Voice clone job completes
- [ ] Subtitle generation job completes
- [ ] Face detection job completes
- [ ] Render job produces video
- [ ] WebSocket updates work
- [ ] Frontend displays projects
- [ ] Frontend shows job progress
- [ ] Files appear in S3/MinIO
- [ ] Database stores all data correctly

---

## Quick Test Commands Reference

```bash
# Health
curl http://localhost:3001/health

# Register
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123"}'

# Create project
curl -X POST http://localhost:3001/api/projects -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Test","format":"16:9"}'

# Create job
curl -X POST http://localhost:3001/api/jobs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"type":"video_download","input":{"url":"..."}}'

# Check job
curl http://localhost:3001/api/jobs/$JOB_ID -H "Authorization: Bearer $TOKEN"
```

---

## Next Steps After Testing

1. **Verify S3 storage**: Check MinIO console for uploaded files
2. **Check database**: Use Prisma Studio to inspect data
3. **Review logs**: Check each service's logs for errors
4. **Test edge cases**: Empty timelines, missing assets, etc.
5. **Performance**: Test with larger videos, multiple concurrent jobs
