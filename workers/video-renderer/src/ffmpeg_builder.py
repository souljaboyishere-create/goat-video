"""
FFmpeg Builder
Builds FFmpeg filter graphs for video composition
Handles video clips, audio mixing, subtitle burn-in, face transformation hooks
"""

import ffmpeg
from typing import List, Dict, Any, Optional
import tempfile
import os


class FFmpegBuilder:
    """Builds FFmpeg command for final video composition"""
    
    def __init__(
        self,
        video_clips: List[str],  # Paths to video files
        audio_path: str,  # Composed audio path
        subtitle_path: Optional[str] = None,  # ASS subtitle file
        output_path: str = None,
        resolution: tuple = (1920, 1080),
        fps: float = 30.0,
        format: str = "16:9",
    ):
        self.video_clips = video_clips
        self.audio_path = audio_path
        self.subtitle_path = subtitle_path
        self.output_path = output_path
        self.resolution = resolution
        self.fps = fps
        self.format = format
    
    def build(self) -> ffmpeg.Stream:
        """
        Build FFmpeg filter graph for final composition
        Returns FFmpeg stream ready to run
        """
        # For now, handle single video + audio + subtitles
        # Multi-clip composition will be handled by timeline resolver
        
        if not self.video_clips:
            raise ValueError("No video clips provided")
        
        # Input video
        video_input = ffmpeg.input(self.video_clips[0])
        
        # Input audio
        audio_input = ffmpeg.input(self.audio_path)
        
        # Build video filter chain
        video_stream = video_input.video
        
        # Scale to target resolution
        video_stream = video_stream.filter(
            "scale",
            self.resolution[0],
            self.resolution[1],
            force_original_aspect_ratio="decrease",
        )
        
        # Pad to exact resolution (letterbox/pillarbox)
        video_stream = video_stream.filter(
            "pad",
            self.resolution[0],
            self.resolution[1],
            "(ow-iw)/2",
            "(oh-ih)/2",
            color="black",
        )
        
        # Set FPS
        video_stream = video_stream.filter("fps", fps=self.fps)
        
        # Burn subtitles if provided
        if self.subtitle_path:
            video_stream = video_stream.filter(
                "subtitles",
                self.subtitle_path,
                force_style="FontName=Arial,FontSize=24,PrimaryColour=&Hffffff",
            )
        
        # Build output
        output = ffmpeg.output(
            video_stream,
            audio_input.audio,
            self.output_path,
            vcodec="libx264",
            acodec="aac",
            preset="medium",
            crf=23,  # Quality (18-28, lower = better)
            pix_fmt="yuv420p",
            movflags="faststart",  # Web-optimized
        )
        
        return output
    
    def build_multi_clip(self, clip_timeline: List[Dict]) -> ffmpeg.Stream:
        """
        Build FFmpeg filter graph for multiple clips with transitions
        More complex composition for future use
        """
        # TODO: Implement multi-clip composition with transitions
        # This will use concat filter or complex filter graph
        pass

