#!/bin/bash

# Start Infrastructure Services

echo "Starting infrastructure services..."
echo ""

cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running"
  exit 1
fi

# Start services
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 5

# Check services
echo ""
echo "Service status:"
docker-compose ps

echo ""
echo "Services started!"
echo ""
echo "PostgreSQL: localhost:5432"
echo "Redis: localhost:6379"
echo "MinIO API: http://localhost:9000"
echo "MinIO Console: http://localhost:9001"
echo ""
echo "Next steps:"
echo "  1. Visit http://localhost:9001 and create bucket 'video-ai-platform'"
echo "  2. Start backend: cd apps/api && pnpm dev"
echo "  3. Start frontend: cd apps/web && pnpm dev"
echo "  4. Start workers (see TESTING_GUIDE.md)"
echo ""

