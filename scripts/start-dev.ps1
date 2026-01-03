# Start Development Servers (PowerShell)
# Cross-platform script to start both web and API servers

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "Starting development servers..." -ForegroundColor Cyan
Write-Host ""

# Check if pnpm is installed
try {
    pnpm --version | Out-Null
} catch {
    Write-Host "Error: pnpm is not installed" -ForegroundColor Red
    Write-Host "Install with: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Start API server in background
Write-Host "Starting API server (port 3001)..." -ForegroundColor Yellow
$apiJob = Start-Job -ScriptBlock {
    Set-Location $using:projectRoot
    Set-Location "apps 2\api"
    pnpm dev
}

# Start Web server in background
Write-Host "Starting Web server (port 3000)..." -ForegroundColor Yellow
$webJob = Start-Job -ScriptBlock {
    Set-Location $using:projectRoot
    Set-Location "apps 2\web"
    pnpm dev
}

Write-Host ""
Write-Host "Servers starting in background..." -ForegroundColor Green
Write-Host ""
Write-Host "API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Web: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  Receive-Job -Job `$apiJob" -ForegroundColor Gray
Write-Host "  Receive-Job -Job `$webJob" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop servers:" -ForegroundColor Yellow
Write-Host "  Stop-Job -Job `$apiJob, `$webJob" -ForegroundColor Gray
Write-Host "  Remove-Job -Job `$apiJob, `$webJob" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow

# Wait for user interrupt
try {
    while ($true) {
        Start-Sleep -Seconds 1
        # Check if jobs are still running
        if ($apiJob.State -eq "Failed" -or $webJob.State -eq "Failed") {
            Write-Host ""
            Write-Host "One or more servers failed. Check logs:" -ForegroundColor Red
            Receive-Job -Job $apiJob, $webJob
            break
        }
    }
} catch {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $apiJob, $webJob -ErrorAction SilentlyContinue
    Remove-Job -Job $apiJob, $webJob -ErrorAction SilentlyContinue
}

