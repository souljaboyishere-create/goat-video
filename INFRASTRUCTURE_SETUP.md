# Infrastructure Setup Guide

## Current Status

The code is **complete and validated**, but infrastructure services (PostgreSQL, Redis, MinIO) need to be started before running the system.

## Option 1: Docker Desktop (Recommended)

### Install Docker Desktop

**macOS:**
1. Download from https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Verify: `docker --version`

### Start Infrastructure

```bash
cd /Users/cameronentezarian/Documents/video-ai-platform
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- MinIO on ports 9000 (API) and 9001 (Console)

### Create MinIO Bucket

1. Visit http://localhost:9001
2. Login: `minioadmin` / `minioadmin`
3. Click "Create Bucket"
4. Name: `video-ai-platform`
5. Click "Create Bucket"

### Verify Services

```bash
docker compose ps
```

All services should show "Up" status.

---

## Option 2: Local Installation

### PostgreSQL

```bash
# Install
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database
createdb video_ai_platform

# Verify
psql -d video_ai_platform -c "SELECT version();"
```

### Redis

```bash
# Install
brew install redis

# Start service
brew services start redis

# Verify
redis-cli ping  # Should return PONG
```

### MinIO

```bash
# Install
brew install minio/stable/minio

# Start (creates /data directory)
minio server ~/minio-data --console-address ":9001"

# In another terminal, create bucket
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/video-ai-platform
```

---

## After Infrastructure is Running

### 1. Run Database Migrations

```bash
cd apps/api
npx prisma migrate dev --name init
```

### 2. Start Backend

```bash
cd apps/api
npm run dev
```

**Expected output:**
```
🚀 Server listening on http://0.0.0.0:3001
Worker processor started
```

### 3. Start Frontend

```bash
cd apps/web
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000
```

### 4. Start Workers

**Video Downloader:**
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

**Other workers:** Same pattern, different ports (8001, 8003, 8005, 8007)

### 5. Run E2E Test

```bash
cd /Users/cameronentezarian/Documents/video-ai-platform
./test-e2e.sh
```

---

## Troubleshooting

### Docker not starting

- Check Docker Desktop is running
- Check system resources (Docker needs RAM)
- Try: `docker system prune` to free space

### Database connection errors

- Verify PostgreSQL is running: `pg_isready`
- Check connection string in `.env`
- Verify database exists: `psql -l | grep video_ai_platform`

### Redis connection errors

- Verify Redis is running: `redis-cli ping`
- Check Redis URL in `.env`

### MinIO connection errors

- Verify MinIO is running: `curl http://localhost:9000/minio/health/live`
- Check bucket exists in console
- Verify credentials in `.env`

---

## Quick Verification

Once all services are running:

```bash
# Check all services
./scripts/check-services.sh

# Test backend health
curl http://localhost:3001/health

# Test worker health
curl http://localhost:8000/health
```

All should return healthy status.

