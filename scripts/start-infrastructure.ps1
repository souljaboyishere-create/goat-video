# Start Infrastructure Services (PowerShell)

Write-Host "Starting infrastructure services..." -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Start services
Write-Host "Starting Docker Compose services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check services
Write-Host ""
Write-Host "Service status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "Services started!" -ForegroundColor Green
Write-Host ""
Write-Host "PostgreSQL: localhost:5432"
Write-Host "Redis: localhost:6379"
Write-Host "MinIO API: http://localhost:9000"
Write-Host "MinIO Console: http://localhost:9001"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Visit http://localhost:9001 and create bucket 'video-ai-platform'"
Write-Host "  2. Start backend: cd apps/api && pnpm dev"
Write-Host "  3. Start frontend: cd apps/web && pnpm dev"
Write-Host "  4. Start workers (see TESTING_GUIDE.md)"
Write-Host ""

