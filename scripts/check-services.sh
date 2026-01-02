#!/bin/bash

# Service Health Check Script

echo "Checking service health..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Backend
echo -n "Backend (3001): "
if curl -s http://localhost:3001/health > /dev/null; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${RED}✗ Not running${NC}"
fi

# Frontend
echo -n "Frontend (3000): "
if curl -s http://localhost:3000 > /dev/null; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${RED}✗ Not running${NC}"
fi

# Workers
echo -n "Video Downloader (8000): "
if curl -s http://localhost:8000/health > /dev/null; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${YELLOW}○ Not running (optional)${NC}"
fi

echo -n "Voice Cloner (8001): "
if curl -s http://localhost:8001/health > /dev/null; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${YELLOW}○ Not running (optional)${NC}"
fi

echo -n "Subtitle Generator (8005): "
if curl -s http://localhost:8005/health > /dev/null; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${YELLOW}○ Not running (optional)${NC}"
fi

echo -n "Face Transformer (8003): "
if curl -s http://localhost:8003/health > /dev/null; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${YELLOW}○ Not running (optional)${NC}"
fi

echo -n "Video Renderer (8007): "
if curl -s http://localhost:8007/health > /dev/null; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${YELLOW}○ Not running (optional)${NC}"
fi

# Infrastructure
echo ""
echo "Infrastructure:"

echo -n "PostgreSQL (5432): "
if docker ps | grep -q video-ai-postgres; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${RED}✗ Not running${NC}"
fi

echo -n "Redis (6379): "
if docker ps | grep -q video-ai-redis; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${RED}✗ Not running${NC}"
fi

echo -n "MinIO (9000): "
if docker ps | grep -q video-ai-minio; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${RED}✗ Not running${NC}"
fi

echo ""

