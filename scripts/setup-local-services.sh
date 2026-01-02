#!/bin/bash

# Setup Local Services (No Docker Required)
# For Apple Silicon Macs when Docker Desktop fails

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "Local Services Setup (No Docker)"
echo "=========================================="
echo ""

# Check for Homebrew
if ! command -v brew &> /dev/null; then
  echo -e "${RED}Error: Homebrew not found${NC}"
  echo "Install Homebrew: https://brew.sh"
  exit 1
fi

echo -e "${GREEN}✓ Homebrew found${NC}"
echo ""

# Install PostgreSQL
echo "Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
  brew install postgresql@15
  brew services start postgresql@15
  sleep 2
else
  echo -e "${YELLOW}PostgreSQL already installed${NC}"
fi

# Create database
echo "Creating database..."
createdb video_ai_platform 2>/dev/null || echo -e "${YELLOW}Database may already exist${NC}"

# Verify PostgreSQL
if psql -d video_ai_platform -c "SELECT version();" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ PostgreSQL running${NC}"
else
  echo -e "${RED}✗ PostgreSQL not running${NC}"
  echo "Try: brew services start postgresql@15"
fi

echo ""

# Install Redis
echo "Installing Redis..."
if ! command -v redis-cli &> /dev/null; then
  brew install redis
  brew services start redis
  sleep 2
else
  echo -e "${YELLOW}Redis already installed${NC}"
fi

# Verify Redis
if redis-cli ping > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Redis running${NC}"
else
  echo -e "${RED}✗ Redis not running${NC}"
  echo "Try: brew services start redis"
fi

echo ""

# Install MinIO
echo "Installing MinIO..."
if ! command -v minio &> /dev/null; then
  brew install minio/stable/minio
else
  echo -e "${YELLOW}MinIO already installed${NC}"
fi

# Create MinIO data directory
mkdir -p ~/minio-data

# Install MinIO client
if ! command -v mc &> /dev/null; then
  brew install minio/stable/mc
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start MinIO (in a separate terminal):"
echo "   minio server ~/minio-data --console-address \":9001\""
echo ""
echo "2. Create MinIO bucket (in another terminal):"
echo "   mc alias set local http://localhost:9000 minioadmin minioadmin"
echo "   mc mb local/video-ai-platform"
echo ""
echo "3. Update apps/api/.env:"
echo "   DATABASE_URL=postgresql://$(whoami)@localhost:5432/video_ai_platform"
echo "   REDIS_URL=redis://localhost:6379"
echo "   S3_ENDPOINT=http://localhost:9000"
echo "   S3_ACCESS_KEY_ID=minioadmin"
echo "   S3_SECRET_ACCESS_KEY=minioadmin"
echo "   S3_BUCKET=video-ai-platform"
echo ""
echo "4. Run migrations:"
echo "   cd apps/api && npx prisma migrate dev"
echo ""
echo "5. Start services:"
echo "   Follow QUICK_START.md"
echo ""

