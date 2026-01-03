# Service Health Check Script (PowerShell)

Write-Host "Checking service health..." -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host -NoNewline "Backend (3001): "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Running" -ForegroundColor Green
} catch {
    Write-Host "✗ Not running" -ForegroundColor Red
}

# Frontend
Write-Host -NoNewline "Frontend (3000): "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Running" -ForegroundColor Green
} catch {
    Write-Host "✗ Not running" -ForegroundColor Red
}

# Workers
Write-Host -NoNewline "Video Downloader (8000): "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Running" -ForegroundColor Green
} catch {
    Write-Host "○ Not running (optional)" -ForegroundColor Yellow
}

Write-Host -NoNewline "Voice Cloner (8001): "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Running" -ForegroundColor Green
} catch {
    Write-Host "○ Not running (optional)" -ForegroundColor Yellow
}

Write-Host -NoNewline "Subtitle Generator (8005): "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8005/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Running" -ForegroundColor Green
} catch {
    Write-Host "○ Not running (optional)" -ForegroundColor Yellow
}

Write-Host -NoNewline "Face Transformer (8003): "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8003/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Running" -ForegroundColor Green
} catch {
    Write-Host "○ Not running (optional)" -ForegroundColor Yellow
}

Write-Host -NoNewline "Video Renderer (8007): "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8007/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Running" -ForegroundColor Green
} catch {
    Write-Host "○ Not running (optional)" -ForegroundColor Yellow
}

# Infrastructure
Write-Host ""
Write-Host "Infrastructure:" -ForegroundColor Cyan

Write-Host -NoNewline "PostgreSQL (5432): "
try {
    $dockerPs = docker ps 2>&1
    if ($dockerPs -match "video-ai-postgres") {
        Write-Host "✓ Running" -ForegroundColor Green
    } else {
        Write-Host "✗ Not running" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Docker not available" -ForegroundColor Red
}

Write-Host -NoNewline "Redis (6379): "
try {
    $dockerPs = docker ps 2>&1
    if ($dockerPs -match "video-ai-redis") {
        Write-Host "✓ Running" -ForegroundColor Green
    } else {
        Write-Host "✗ Not running" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Docker not available" -ForegroundColor Red
}

Write-Host -NoNewline "MinIO (9000): "
try {
    $dockerPs = docker ps 2>&1
    if ($dockerPs -match "video-ai-minio") {
        Write-Host "✓ Running" -ForegroundColor Green
    } else {
        Write-Host "✗ Not running" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Docker not available" -ForegroundColor Red
}

Write-Host ""

