# Video Downloader Worker

Downloads videos from YouTube, Rumble, X/Twitter, TikTok, Instagram using yt-dlp.

## Worker Contract

- `POST /execute` - Execute download job
- `GET /health` - Health check
- `POST /status` - Status update (called internally, not part of contract)

## Environment Variables

- `S3_ENDPOINT` - S3 endpoint URL
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `S3_BUCKET` - S3 bucket name
- `S3_REGION` - S3 region
- `BACKEND_API_URL` - Backend API URL for status updates
- `WORKER_API_KEY` - API key for authenticating with backend

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Run worker
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## Docker

```bash
docker build -t video-downloader-worker .
docker run -p 8000:8000 --env-file .env video-downloader-worker
```

