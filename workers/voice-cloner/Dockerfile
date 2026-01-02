FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU version (for GPU, use nvidia/cuda base image)
# For GPU: FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY src/ ./src/

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run worker
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

