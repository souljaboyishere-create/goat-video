# Quick Start Guide

Fastest way to get the system running for testing.

## Prerequisites

- Node.js 20+
- pnpm (or npm)
- Python 3.11+
- Docker (for infrastructure services)

## 1. Start Infrastructure (Docker)

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

## 2. Setup Backend

```bash
cd apps/api

# Install dependencies
pnpm install

# Setup environment
cp ../../.env.example .env
# Edit .env with database URL: postgresql://videoai:videoai123@localhost:5432/video_ai_platform

# Initialize database
pnpm prisma:generate
pnpm prisma:migrate dev --name init

# Start backend
pnpm dev
```

Backend runs on http://localhost:3001

## 3. Setup Frontend

```bash
cd apps/web

# Install dependencies
pnpm install

# Setup environment
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start frontend
pnpm dev
```

Frontend runs on http://localhost:3000

## 4. Start Workers (Choose One)

### Option A: Start All Workers Manually

Open separate terminals for each:

```bash
# Terminal 1: Video Downloader
cd workers/video-downloader
pip install -r requirements.txt
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_BUCKET=video-ai-platform
export BACKEND_API_URL=http://localhost:3001
export WORKER_API_KEY=test-worker-key-123
uvicorn src.main:app --host 0.0.0.0 --port 8000

# Terminal 2: Voice Cloner (port 8001)
# Terminal 3: Subtitle Generator (port 8005)
# Terminal 4: Face Transformer (port 8003)
# Terminal 5: Video Renderer (port 8007)
# (Same pattern, different ports)
```

### Option B: Start Only Video Downloader (Minimal Test)

For quick testing, you only need the video downloader:

```bash
cd workers/video-downloader
pip install -r requirements.txt
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_BUCKET=video-ai-platform
export BACKEND_API_URL=http://localhost:3001
export WORKER_API_KEY=test-worker-key-123
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## 5. Run E2E Test

```bash
cd /Users/cameronentezarian/Documents/video-ai-platform
./test-e2e.sh
```

This will:
1. Register a test user
2. Create a project
3. Download a test video
4. Show job progress

## 6. Access Frontend

Open http://localhost:3000

- Register/Login
- Create project
- Add video URL
- Watch job progress
- View timeline

## Troubleshooting

### Services won't start

```bash
# Check Docker
docker ps

# Check ports
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
lsof -i :8000  # Worker
```

### Database errors

```bash
# Reset database
cd apps/api
pnpm prisma:migrate reset

# Or recreate
docker-compose down -v
docker-compose up -d
pnpm prisma:migrate dev
```

### Workers not connecting

- Check `WORKER_API_KEY` matches in backend `.env` and worker environment
- Check `BACKEND_API_URL` in worker environment
- Check backend logs for "Worker processor started"

## Next Steps

See `TESTING_GUIDE.md` for comprehensive testing instructions.

