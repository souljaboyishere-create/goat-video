# Docker API Version Issue - Fix

## Problem

Docker Desktop is showing API version errors:
```
request returned 500 Internal Server Error for API route and version
```

## Solution 1: Restart Docker Desktop

1. **Quit Docker Desktop completely:**
   - Click Docker icon in menu bar
   - Select "Quit Docker Desktop"

2. **Wait 10 seconds**

3. **Restart Docker Desktop:**
   - Open Docker Desktop from Applications
   - Wait for it to fully start (whale icon stops animating)

4. **Try again:**
   ```bash
   cd /Users/cameronentezarian/Documents/video-ai-platform
   docker compose up -d
   ```

## Solution 2: Use Default Docker Context

```bash
# Switch to default context
docker context use default

# Try docker compose again
cd /Users/cameronentezarian/Documents/video-ai-platform
docker compose up -d
```

## Solution 3: Update Docker Desktop

The API version mismatch might be due to an outdated Docker Desktop:

1. **Check current version:**
   ```bash
   docker --version
   ```

2. **Update Docker Desktop:**
   - Open Docker Desktop
   - Go to Settings → Software Updates
   - Click "Check for updates"
   - Install if available

## Solution 4: Use Colima Instead

If Docker Desktop continues to have issues:

```bash
# Install Colima
brew install colima docker docker-compose

# Start Colima
colima start

# Use docker compose
cd /Users/cameronentezarian/Documents/video-ai-platform
docker compose up -d
```

## Solution 5: Local Services (No Docker)

If Docker continues to fail:

```bash
./scripts/setup-local-services.sh
```

This installs PostgreSQL, Redis, and MinIO via Homebrew.

---

## Quick Test

After trying any solution, test with:

```bash
docker ps
docker pull hello-world
docker run hello-world
```

If these work, then `docker compose up -d` should work too.

