# ✅ Rosetta Installed - Next Steps

## Status

✅ **Rosetta 2 successfully installed!**

You can now:
1. **Retry Docker Desktop installation** (recommended)
2. **Use Colima** (lightweight alternative)
3. **Use local services** (no Docker needed)

---

## Option 1: Retry Docker Desktop (Recommended)

Now that Rosetta is installed:

1. **Download Docker Desktop for Apple Silicon:**
   - Go to: https://www.docker.com/products/docker-desktop/
   - Make sure to download the **Apple Silicon** version (not Intel)

2. **Install Docker Desktop:**
   - Open the downloaded `.dmg`
   - Drag Docker to Applications
   - Launch Docker Desktop
   - It should now install without Rosetta errors

3. **Verify:**
   ```bash
   docker --version
   docker compose version
   ```

4. **Start infrastructure:**
   ```bash
   cd /Users/cameronentezarian/Documents/video-ai-platform
   docker compose up -d
   ```

---

## Option 2: Use Colima (Fastest Alternative)

If Docker Desktop still has issues, Colima is often more reliable:

```bash
# Install Colima
brew install colima docker docker-compose

# Start Colima
colima start

# Verify
docker ps

# Use docker compose as normal
cd /Users/cameronentezarian/Documents/video-ai-platform
docker compose up -d
```

**Benefits:**
- ✅ Lighter weight than Docker Desktop
- ✅ Better Apple Silicon support
- ✅ Uses less RAM
- ✅ Works with all `docker compose` commands

---

## Option 3: Local Services (No Docker)

If you prefer native services:

```bash
# Run the setup script
./scripts/setup-local-services.sh
```

This will:
- Install PostgreSQL via Homebrew
- Install Redis via Homebrew
- Install MinIO via Homebrew
- Create the database
- Start all services

**Then:**
1. Start MinIO manually (in separate terminal):
   ```bash
   minio server ~/minio-data --console-address ":9001"
   ```

2. Create MinIO bucket:
   ```bash
   mc alias set local http://localhost:9000 minioadmin minioadmin
   mc mb local/video-ai-platform
   ```

3. Update `apps/api/.env` with local connection strings

---

## Recommended: Try Docker Desktop First

Since Rosetta is now installed, Docker Desktop should work. Try:

1. Download Docker Desktop for Apple Silicon
2. Install and launch
3. If it works → proceed with `docker compose up -d`
4. If it still fails → use Colima (Option 2)

---

## After Infrastructure is Running

Once you have services running (via any method):

```bash
# 1. Run migrations
cd apps/api
npx prisma migrate dev --name init

# 2. Start backend
npm run dev

# 3. In another terminal, start frontend
cd apps/web
npm run dev

# 4. In another terminal, start video downloader worker
cd workers/video-downloader
pip install -r requirements.txt
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_BUCKET=video-ai-platform
export BACKEND_API_URL=http://localhost:3001
export WORKER_API_KEY=test-worker-key-123
uvicorn src.main:app --host 0.0.0.0 --port 8000

# 5. Run E2E test
cd /Users/cameronentezarian/Documents/video-ai-platform
./test-e2e.sh
```

---

## Quick Decision Guide

**Choose Docker Desktop if:**
- You want the easiest setup
- You're comfortable with Docker
- You have 4GB+ RAM available

**Choose Colima if:**
- Docker Desktop still has issues
- You want something lighter
- You prefer command-line tools

**Choose Local Services if:**
- You want native macOS services
- You don't need containerization
- You prefer Homebrew-managed services

---

## Need Help?

- **Docker issues:** See `DOCKER_TROUBLESHOOTING.md`
- **Local setup:** See `INFRASTRUCTURE_SETUP.md` (Option 2)
- **Code validation:** Run `./scripts/validate-code.sh`

