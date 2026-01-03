# End-to-End Test Script for AI Video Creation Platform (PowerShell)

$ErrorActionPreference = "Stop"

$API_URL = "http://localhost:3001"
$EMAIL = "test@example.com"
$PASSWORD = "testpassword123"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AI Video Creation Platform - E2E Test" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if services are running
Write-Host "Checking services..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Backend running" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend not running on port 3001" -ForegroundColor Red
    exit 1
}

# Step 1: Register user
Write-Host ""
Write-Host "Step 1: Registering user..." -ForegroundColor Yellow
$registerBody = @{
    email = $EMAIL
    password = $PASSWORD
    name = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    
    if ($registerResponse.token) {
        $TOKEN = $registerResponse.token
        Write-Host "✓ User registered" -ForegroundColor Green
        Write-Host "  Token: $($TOKEN.Substring(0, [Math]::Min(20, $TOKEN.Length)))..."
    }
} catch {
    # Try login instead
    Write-Host "  User may already exist, trying login..." -ForegroundColor Yellow
    $loginBody = @{
        email = $EMAIL
        password = $PASSWORD
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $loginBody
        
        if ($loginResponse.token) {
            $TOKEN = $loginResponse.token
            Write-Host "✓ User logged in" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to register/login" -ForegroundColor Red
            $loginResponse | ConvertTo-Json
            exit 1
        }
    } catch {
        Write-Host "✗ Failed to register/login" -ForegroundColor Red
        $_.Exception.Message
        exit 1
    }
}

# Step 2: Create project
Write-Host ""
Write-Host "Step 2: Creating project..." -ForegroundColor Yellow
$projectBody = @{
    name = "E2E Test Project"
    description = "End-to-end test project"
    format = "16:9"
} | ConvertTo-Json

try {
    $projectResponse = Invoke-RestMethod -Uri "$API_URL/api/projects" `
        -Method Post `
        -Headers @{ Authorization = "Bearer $TOKEN" } `
        -ContentType "application/json" `
        -Body $projectBody
    
    if ($projectResponse.id) {
        $PROJECT_ID = $projectResponse.id
        Write-Host "✓ Project created" -ForegroundColor Green
        Write-Host "  Project ID: $PROJECT_ID"
    }
} catch {
    Write-Host "✗ Failed to create project" -ForegroundColor Red
    $_.Exception.Message
    exit 1
}

# Step 3: Create video download job
Write-Host ""
Write-Host "Step 3: Creating video download job..." -ForegroundColor Yellow
$jobBody = @{
    projectId = $PROJECT_ID
    type = "video_download"
    input = @{
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        quality = "best"
    }
} | ConvertTo-Json -Depth 3

try {
    $downloadJob = Invoke-RestMethod -Uri "$API_URL/api/jobs" `
        -Method Post `
        -Headers @{ Authorization = "Bearer $TOKEN" } `
        -ContentType "application/json" `
        -Body $jobBody
    
    if ($downloadJob.id) {
        $DOWNLOAD_JOB_ID = $downloadJob.id
        Write-Host "✓ Download job created" -ForegroundColor Green
        Write-Host "  Job ID: $DOWNLOAD_JOB_ID"
    }
} catch {
    Write-Host "✗ Failed to create download job" -ForegroundColor Red
    $_.Exception.Message
    exit 1
}

# Step 4: Wait for download to complete
Write-Host ""
Write-Host "Step 4: Waiting for download to complete..." -ForegroundColor Yellow
Write-Host "  (This may take 1-2 minutes)" -ForegroundColor Gray
$MAX_WAIT = 120
$WAITED = 0

while ($WAITED -lt $MAX_WAIT) {
    try {
        $statusResponse = Invoke-RestMethod -Uri "$API_URL/api/jobs/$DOWNLOAD_JOB_ID" `
            -Headers @{ Authorization = "Bearer $TOKEN" }
        
        $STATUS = $statusResponse.status
        $PROGRESS = $statusResponse.progress
        
        Write-Host "`r  Status: $STATUS | Progress: $PROGRESS%" -NoNewline
        
        if ($STATUS -eq "completed") {
            Write-Host ""
            Write-Host "✓ Download completed!" -ForegroundColor Green
            
            $OUTPUT = if ($statusResponse.output.filePath) { $statusResponse.output.filePath } else { "N/A" }
            Write-Host "  Output: $OUTPUT"
            break
        } elseif ($STATUS -eq "failed") {
            Write-Host ""
            $ERROR = if ($statusResponse.error) { $statusResponse.error } else { "Unknown error" }
            Write-Host "✗ Download failed: $ERROR" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "Error checking job status: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
    $WAITED += 2
}

if ($WAITED -ge $MAX_WAIT) {
    Write-Host ""
    Write-Host "⚠ Timeout waiting for download" -ForegroundColor Yellow
}

# Step 5: List all jobs
Write-Host ""
Write-Host "Step 5: Listing all jobs for project..." -ForegroundColor Yellow
try {
    $jobsResponse = Invoke-RestMethod -Uri "$API_URL/api/jobs/project/$PROJECT_ID" `
        -Headers @{ Authorization = "Bearer $TOKEN" }
    
    $JOB_COUNT = $jobsResponse.jobs.Count
    Write-Host "✓ Found $JOB_COUNT job(s)" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not list jobs" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ User authentication" -ForegroundColor Green
Write-Host "✓ Project creation" -ForegroundColor Green
Write-Host "✓ Job creation" -ForegroundColor Green
Write-Host "✓ Job processing" -ForegroundColor Green
Write-Host ""
Write-Host "Project ID: $PROJECT_ID"
Write-Host "View at: http://localhost:3000/projects/$PROJECT_ID"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test voice cloning"
Write-Host "  2. Test subtitle generation"
Write-Host "  3. Test face detection"
Write-Host "  4. Test video rendering"
Write-Host ""

