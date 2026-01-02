"""
Video downloader utilities
"""

import os
import uuid
import yt_dlp
from typing import Dict, Optional


def download_video(
    url: str,
    quality: str = "best",
    format: str = "mp4",
    output_dir: str = "/tmp",
) -> Dict:
    """
    Download video using yt-dlp
    
    Returns:
        dict with file_path, duration, width, height, title, video_id, ext
    """
    output_template = f"{output_dir}/%(id)s.%(ext)s"

    ydl_opts = {
        "format": quality if quality != "best" else "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "outtmpl": output_template,
        "quiet": False,
        "no_warnings": False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info.get("id", str(uuid.uuid4()))
        ext = info.get("ext", "mp4")
        file_path = f"{output_dir}/{video_id}.{ext}"

        # Get video metadata
        duration = info.get("duration", 0)
        width = info.get("width", 0)
        height = info.get("height", 0)
        title = info.get("title", "Untitled")

        return {
            "file_path": file_path,
            "duration": duration,
            "width": width,
            "height": height,
            "title": title,
            "video_id": video_id,
            "ext": ext,
        }


def get_platform_from_url(url: str) -> str:
    """Detect platform from URL"""
    if "youtube.com" in url or "youtu.be" in url:
        return "youtube"
    elif "rumble.com" in url:
        return "rumble"
    elif "twitter.com" in url or "x.com" in url:
        return "twitter"
    elif "tiktok.com" in url:
        return "tiktok"
    elif "instagram.com" in url:
        return "instagram"
    return "unknown"

