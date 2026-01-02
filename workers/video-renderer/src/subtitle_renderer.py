"""
Subtitle Renderer
Renders subtitles as ASS format for burn-in or sidecar export
"""

import pysrt
from typing import List, Dict, Any
import tempfile
import os


class SubtitleRenderer:
    """Renders subtitles from timeline and SRT files"""
    
    def __init__(self, subtitles: List[Dict], output_path: str):
        self.subtitles = subtitles
        self.output_path = output_path
    
    def render_ass(self) -> str:
        """
        Render subtitles as ASS format for FFmpeg burn-in
        Returns path to ASS file
        """
        ass_lines = [
            "[Script Info]",
            "Title: Video Subtitles",
            "ScriptType: v4.00+",
            "",
            "[V4+ Styles]",
            "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
            "Style: Default,Arial,24,&Hffffff,&Hffffff,&H0,&H0,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1",
            "",
            "[Events]",
            "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
        ]
        
        # Sort subtitles by start time
        sorted_subs = sorted(
            self.subtitles,
            key=lambda x: x["clip"].startTime
        )
        
        for sub_data in sorted_subs:
            clip = sub_data["clip"]
            # Get subtitle text from clip or SRT file
            text = self._get_subtitle_text(clip)
            if not text:
                continue
            
            clip_start = clip.get("startTime", 0) if isinstance(clip, dict) else (getattr(clip, "startTime", 0) if hasattr(clip, "startTime") else 0)
            clip_duration = clip.get("duration", 0) if isinstance(clip, dict) else (getattr(clip, "duration", 0) if hasattr(clip, "duration") else 0)
            
            start_time = self._format_ass_time(clip_start)
            end_time = self._format_ass_time(clip_start + clip_duration)
            
            ass_lines.append(
                f"Dialogue: 0,{start_time},{end_time},Default,,0,0,0,,{text}"
            )
        
        # Write ASS file
        with open(self.output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(ass_lines))
        
        return self.output_path
    
    def _get_subtitle_text(self, clip: Any) -> str:
        """Get subtitle text from clip"""
        # Handle dict or object
        if isinstance(clip, dict):
            # Check if clip has subtitle data
            if clip.get("subtitles"):
                # Get text for current time
                # TODO: Extract from subtitle segments
                return "Subtitle text"  # Placeholder
        else:
            # Check if clip has subtitle data
            if hasattr(clip, "subtitles") and clip.subtitles:
                # Get text for current time
                # TODO: Extract from subtitle segments
                return "Subtitle text"  # Placeholder
        
        return None
    
    def _format_ass_time(self, seconds: float) -> str:
        """Convert seconds to ASS time format (H:MM:SS.cc)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        centisecs = int((seconds % 1) * 100)
        return f"{hours}:{minutes:02d}:{secs:02d}.{centisecs:02d}"

