#!/bin/bash

# Start Development Servers (Bash)
# Cross-platform script to start both web and API servers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Starting development servers..."
echo ""

cd "$PROJECT_ROOT"

# Start API server in background
echo "Starting API server (port 3001)..."
cd "apps 2/api"
pnpm dev &
API_PID=$!
cd "$PROJECT_ROOT"

# Start Web server in background
echo "Starting Web server (port 3000)..."
cd "apps 2/web"
pnpm dev &
WEB_PID=$!
cd "$PROJECT_ROOT"

echo ""
echo "Servers starting in background..."
echo ""
echo "API: http://localhost:3001"
echo "Web: http://localhost:3000"
echo ""
echo "API PID: $API_PID"
echo "Web PID: $WEB_PID"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "echo ''; echo 'Stopping servers...'; kill $API_PID $WEB_PID 2>/dev/null; exit" INT TERM

wait

