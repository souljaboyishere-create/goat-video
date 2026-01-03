# Quick Start Guide

Fastest way to get the system running for testing.

## Prerequisites

- Node.js 20+
- pnpm (or npm) - Install with `npm install -g pnpm`
- Python 3.11+ (for workers)
- Docker (for infrastructure services) - Optional, can use local services

**Note:** This project is cross-platform compatible. Use PowerShell scripts on Windows and Bash scripts on macOS/Linux.

## 1. Start Infrastructure (Docker)

**Windows (PowerShell):**
```powershell
# From project root
.\scripts\start-infrastructure.ps1

# Or manually:
docker-compose up -d
```

**macOS/Linux (Bash):**
```bash
# From project root
./scripts/start-infrastructure.sh

# Or manually:
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

**Windows (PowerShell):**
```powershell
cd "apps 2\api"

# Install dependencies
pnpm install

# Setup environment (if .env.example exists)
if (Test-Path ..\..\.env.example) {
    Copy-Item ..\..\.env.example .env
}
# Edit .env with database URL: postgresql://videoai:videoai123@localhost:5432/video_ai_platform

# Initialize database
pnpm prisma:generate
pnpm prisma:migrate dev --name init

# Start backend
pnpm dev
```

**macOS/Linux (Bash):**
```bash
cd "apps 2/api"

# Install dependencies
pnpm install

# Setup environment (if .env.example exists)
cp ../../.env.example .env 2>/dev/null || true
# Edit .env with database URL: postgresql://videoai:videoai123@localhost:5432/video_ai_platform

# Initialize database
pnpm prisma:generate
pnpm prisma:migrate dev --name init

# Start backend
pnpm dev
```

Backend runs on http://localhost:3001

## 3. Setup Frontend

**Windows (PowerShell):**
```powershell
cd "apps 2\web"

# Install dependencies
pnpm install

# Setup environment
"NEXT_PUBLIC_API_URL=http://localhost:3001" | Out-File -FilePath .env.local -Encoding utf8

# Start frontend
pnpm dev
```

**macOS/Linux (Bash):**
```bash
cd "apps 2/web"

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

**Windows (PowerShell):**
```powershell
# From project root
.\scripts\test-e2e.ps1
```

**macOS/Linux (Bash):**
```bash
# From project root
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

**Windows (PowerShell):**
```powershell
# Check Docker
docker ps

# Check ports
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -eq 3001 -or $_.LocalPort -eq 3000 -or $_.LocalPort -eq 8000}

# Or use the health check script
.\scripts\check-services.ps1
```

**macOS/Linux (Bash):**
```bash
# Check Docker
docker ps

# Check ports
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
lsof -i :8000  # Worker

# Or use the health check script
./scripts/check-services.sh
```

### Database errors

**Windows (PowerShell):**
```powershell
# Reset database
cd "apps 2\api"
pnpm prisma:migrate reset

# Or recreate
cd ..\..
docker-compose down -v
docker-compose up -d
cd "apps 2\api"
pnpm prisma:migrate dev
```

**macOS/Linux (Bash):**
```bash
# Reset database
cd "apps 2/api"
pnpm prisma:migrate reset

# Or recreate
cd ../..
docker-compose down -v
docker-compose up -d
cd "apps 2/api"
pnpm prisma:migrate dev
```

### Workers not connecting

- Check `WORKER_API_KEY` matches in backend `.env` and worker environment
- Check `BACKEND_API_URL` in worker environment
- Check backend logs for "Worker processor started"

## Next Steps

See `TESTING_GUIDE.md` for comprehensive testing instructions.

