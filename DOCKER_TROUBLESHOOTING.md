# Docker Desktop Installation Troubleshooting

## Rosetta Installation Error

If you're seeing:
```
Error Domain=VZErrorDomain Code=1 Description="Internal Virtualization error. Failed to install Rosetta."
```

This is a common issue on Apple Silicon Macs (M1/M2/M3).

## Solution 1: Manual Rosetta Installation

### Step 1: Install Rosetta Manually

```bash
# Open Terminal and run:
softwareupdate --install-rosetta
```

You'll be prompted to agree to the license. Type `A` and press Enter.

### Step 2: Verify Rosetta

```bash
# Check if Rosetta is installed
/usr/libexec/oahd --version
```

### Step 3: Retry Docker Desktop Installation

1. Download Docker Desktop again: https://www.docker.com/products/docker-desktop/
2. Make sure you download the **Apple Silicon** version (not Intel)
3. Install and restart your Mac if needed

## Solution 2: Use Docker Desktop Beta/Preview

Sometimes the stable version has issues. Try:

1. Download Docker Desktop **Preview** or **Beta** version
2. These often have better Apple Silicon support
3. Available at: https://docs.docker.com/desktop/release-notes/

## Solution 3: Use Colima (Lightweight Alternative)

Colima is a lightweight Docker runtime that works well on Apple Silicon:

### Install Colima

```bash
# Install via Homebrew
brew install colima docker docker-compose

# Start Colima
colima start

# Verify
docker ps
```

### Use with Docker Compose

```bash
# Colima works with docker compose commands
cd /Users/cameronentezarian/Documents/video-ai-platform
docker compose up -d
```

**Note:** Colima uses less resources than Docker Desktop and is often more reliable on Apple Silicon.

## Solution 4: Local Services (No Docker)

If Docker continues to fail, you can run services locally:

### Install PostgreSQL

```bash
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb video_ai_platform

# Verify
psql -d video_ai_platform -c "SELECT version();"
```

### Install Redis

```bash
brew install redis
brew services start redis

# Verify
redis-cli ping  # Should return PONG
```

### Install MinIO

```bash
brew install minio/stable/minio

# Create data directory
mkdir -p ~/minio-data

# Start MinIO (in a separate terminal)
minio server ~/minio-data --console-address ":9001"
```

**Access MinIO Console:** http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin`

**Create bucket:**
```bash
# Install MinIO client
brew install minio/stable/mc

# Configure alias
mc alias set local http://localhost:9000 minioadmin minioadmin

# Create bucket
mc mb local/video-ai-platform
```

### Update Environment Variables

Update `apps/api/.env`:
```env
DATABASE_URL=postgresql://$(whoami)@localhost:5432/video_ai_platform
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET=video-ai-platform
```

## Solution 5: Use Podman (Docker Alternative)

Podman is a Docker-compatible alternative:

```bash
# Install Podman
brew install podman

# Initialize Podman machine
podman machine init
podman machine start

# Use podman-compose or docker-compose with podman
alias docker=podman
docker compose up -d
```

## Recommended Approach

**For Apple Silicon Macs, I recommend:**

1. **First try:** Manual Rosetta installation + Docker Desktop
2. **If that fails:** Use Colima (easiest alternative)
3. **If you prefer native:** Local services via Homebrew

## Verification After Setup

Once you have Docker (or alternative) working:

```bash
# Test Docker
docker --version
docker compose version

# Test services
cd /Users/cameronentezarian/Documents/video-ai-platform
docker compose up -d
docker compose ps

# All should show "Up"
```

## Next Steps

After resolving Docker:

1. Start infrastructure: `docker compose up -d`
2. Create MinIO bucket (via console or CLI)
3. Run migrations: `cd apps/api && npx prisma migrate dev`
4. Start services: Follow `QUICK_START.md`
5. Run E2E test: `./test-e2e.sh`

## Still Having Issues?

If none of these work:

1. Check macOS version: `sw_vers`
2. Check available disk space: `df -h`
3. Check system integrity: `csrutil status`
4. Try restarting your Mac
5. Check Docker Desktop system requirements: https://docs.docker.com/desktop/install/mac-install/

