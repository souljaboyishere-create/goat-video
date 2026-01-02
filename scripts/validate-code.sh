#!/bin/bash

# Code Validation Script
# Tests code structure without requiring infrastructure

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "Code Validation Test"
echo "=========================================="
echo ""

ERRORS=0

# Check TypeScript compilation
echo -n "TypeScript compilation: "
cd apps/api
if npx tsc --noEmit > /dev/null 2>&1; then
  echo -e "${GREEN}✓ PASS${NC}"
else
  echo -e "${RED}✗ FAIL${NC}"
  npx tsc --noEmit 2>&1 | head -5
  ERRORS=$((ERRORS + 1))
fi
cd ../..

# Check Prisma schema
echo -n "Prisma schema validation: "
cd apps/api
if npx prisma validate > /dev/null 2>&1; then
  echo -e "${GREEN}✓ PASS${NC}"
else
  echo -e "${RED}✗ FAIL${NC}"
  npx prisma validate 2>&1 | head -5
  ERRORS=$((ERRORS + 1))
fi
cd ../..

# Check Python syntax
echo -n "Python syntax check: "
PYTHON_ERRORS=0
for worker in workers/*/src/*.py; do
  if [ -f "$worker" ]; then
    if ! python3 -m py_compile "$worker" 2>/dev/null; then
      PYTHON_ERRORS=$((PYTHON_ERRORS + 1))
    fi
  fi
done
if [ $PYTHON_ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ PASS${NC}"
else
  echo -e "${RED}✗ FAIL ($PYTHON_ERRORS files)${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check file structure
echo -n "File structure: "
BACKEND_FILES=$(find apps/api/src -name "*.ts" | wc -l | tr -d ' ')
WORKER_FILES=$(find workers/*/src -name "*.py" 2>/dev/null | wc -l | tr -d ' ')
FRONTEND_FILES=$(find apps/web/src -name "*.tsx" -o -name "*.ts" | wc -l | tr -d ' ')

if [ "$BACKEND_FILES" -ge 9 ] && [ "$WORKER_FILES" -ge 15 ] && [ "$FRONTEND_FILES" -ge 6 ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  echo "  Backend: $BACKEND_FILES files"
  echo "  Workers: $WORKER_FILES files"
  echo "  Frontend: $FRONTEND_FILES files"
else
  echo -e "${YELLOW}⚠ PARTIAL${NC}"
  echo "  Backend: $BACKEND_FILES files (expected: 9+)"
  echo "  Workers: $WORKER_FILES files (expected: 15+)"
  echo "  Frontend: $FRONTEND_FILES files (expected: 6+)"
fi

# Check key files exist
echo -n "Key files check: "
MISSING=0
for file in \
  "apps/api/src/index.ts" \
  "apps/api/prisma/schema.prisma" \
  "apps/web/src/app/page.tsx" \
  "workers/video-downloader/src/main.py" \
  "workers/voice-cloner/src/main.py" \
  "shared/types/timeline.ts"; do
  if [ ! -f "$file" ]; then
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -eq 0 ]; then
  echo -e "${GREEN}✓ PASS${NC}"
else
  echo -e "${RED}✗ FAIL ($MISSING missing)${NC}"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}All code validation tests PASSED${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Install Docker Desktop"
  echo "  2. Run: docker compose up -d"
  echo "  3. Follow INFRASTRUCTURE_SETUP.md"
  exit 0
else
  echo -e "${RED}Code validation FAILED ($ERRORS errors)${NC}"
  exit 1
fi

