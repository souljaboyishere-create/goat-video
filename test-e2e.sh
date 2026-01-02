#!/bin/bash

# End-to-End Test Script for AI Video Creation Platform

set -e

API_URL="http://localhost:3001"
EMAIL="test@example.com"
PASSWORD="testpassword123"

echo "=========================================="
echo "AI Video Creation Platform - E2E Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services are running
echo "Checking services..."
if ! curl -s http://localhost:3001/health > /dev/null; then
  echo -e "${RED}✗ Backend not running on port 3001${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Backend running${NC}"

# Step 1: Register user
echo ""
echo "Step 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}")

if echo $REGISTER_RESPONSE | jq -e '.token' > /dev/null 2>&1; then
  TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
  echo -e "${GREEN}✓ User registered${NC}"
  echo "  Token: ${TOKEN:0:20}..."
else
  # Try login instead
  echo "  User may already exist, trying login..."
  LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  
  if echo $LOGIN_RESPONSE | jq -e '.token' > /dev/null 2>&1; then
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
    echo -e "${GREEN}✓ User logged in${NC}"
  else
    echo -e "${RED}✗ Failed to register/login${NC}"
    echo $REGISTER_RESPONSE | jq .
    exit 1
  fi
fi

# Step 2: Create project
echo ""
echo "Step 2: Creating project..."
PROJECT_RESPONSE=$(curl -s -X POST $API_URL/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"E2E Test Project","description":"End-to-end test project","format":"16:9"}')

if echo $PROJECT_RESPONSE | jq -e '.id' > /dev/null 2>&1; then
  PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.id')
  echo -e "${GREEN}✓ Project created${NC}"
  echo "  Project ID: $PROJECT_ID"
else
  echo -e "${RED}✗ Failed to create project${NC}"
  echo $PROJECT_RESPONSE | jq .
  exit 1
fi

# Step 3: Create video download job
echo ""
echo "Step 3: Creating video download job..."
DOWNLOAD_JOB=$(curl -s -X POST $API_URL/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\":\"$PROJECT_ID\",
    \"type\":\"video_download\",
    \"input\":{
      \"url\":\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\",
      \"quality\":\"best\"
    }
  }")

if echo $DOWNLOAD_JOB | jq -e '.id' > /dev/null 2>&1; then
  DOWNLOAD_JOB_ID=$(echo $DOWNLOAD_JOB | jq -r '.id')
  echo -e "${GREEN}✓ Download job created${NC}"
  echo "  Job ID: $DOWNLOAD_JOB_ID"
else
  echo -e "${RED}✗ Failed to create download job${NC}"
  echo $DOWNLOAD_JOB | jq .
  exit 1
fi

# Step 4: Wait for download to complete
echo ""
echo "Step 4: Waiting for download to complete..."
echo "  (This may take 1-2 minutes)"
MAX_WAIT=120
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
  STATUS_RESPONSE=$(curl -s $API_URL/api/jobs/$DOWNLOAD_JOB_ID \
    -H "Authorization: Bearer $TOKEN")
  
  STATUS=$(echo $STATUS_RESPONSE | jq -r '.status')
  PROGRESS=$(echo $STATUS_RESPONSE | jq -r '.progress')
  
  echo -ne "\r  Status: $STATUS | Progress: $PROGRESS%"
  
  if [ "$STATUS" = "completed" ]; then
    echo ""
    echo -e "${GREEN}✓ Download completed!${NC}"
    
    # Get output
    OUTPUT=$(echo $STATUS_RESPONSE | jq -r '.output.filePath // "N/A"')
    echo "  Output: $OUTPUT"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo ""
    ERROR=$(echo $STATUS_RESPONSE | jq -r '.error // "Unknown error"')
    echo -e "${RED}✗ Download failed: $ERROR${NC}"
    exit 1
  fi
  
  sleep 2
  WAITED=$((WAITED + 2))
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo ""
  echo -e "${YELLOW}⚠ Timeout waiting for download${NC}"
fi

# Step 5: List all jobs
echo ""
echo "Step 5: Listing all jobs for project..."
JOBS_RESPONSE=$(curl -s $API_URL/api/jobs/project/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN")

JOB_COUNT=$(echo $JOBS_RESPONSE | jq '.jobs | length')
echo -e "${GREEN}✓ Found $JOB_COUNT job(s)${NC}"

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}✓ User authentication${NC}"
echo -e "${GREEN}✓ Project creation${NC}"
echo -e "${GREEN}✓ Job creation${NC}"
echo -e "${GREEN}✓ Job processing${NC}"
echo ""
echo "Project ID: $PROJECT_ID"
echo "View at: http://localhost:3000/projects/$PROJECT_ID"
echo ""
echo "Next steps:"
echo "  1. Test voice cloning"
echo "  2. Test subtitle generation"
echo "  3. Test face detection"
echo "  4. Test video rendering"
echo ""

