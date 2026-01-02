"""
Audio Composer
Composes multiple audio tracks into single audio stream
Handles voice audio, music, volume ducking, etc.
"""

import ffmpeg
from typing import List, Dict, Any
import tempfile
import os
import uuid


class AudioComposer:
    """Composes audio from timeline audio tracks"""
    
    def __init__(self, audio_clips: List[Dict], output_path: str, sample_rate: int = 44100):
        self.audio_clips = audio_clips
        self.output_path = output_path
        self.sample_rate = sample_rate
    
    def compose(self) -> str:
        """
        Compose audio from clips
        Returns path to composed audio file
        """
        if not self.audio_clips:
            # Generate silence (1 second default, will be trimmed by video duration)
            return self._generate_silence(duration=1.0)
        
        # Sort clips by start time
        sorted_clips = sorted(
            self.audio_clips,
            key=lambda x: x["clip"].startTime
        )
        
        # Build FFmpeg filter graph for audio mixing
        audio_inputs = []
        filter_parts = []
        
        for idx, clip_data in enumerate(sorted_clips):
            clip = clip_data["clip"]
            track = clip_data["track"]
            local_time = clip_data["local_time"]
            
            # Get audio file path (from clip metadata or job output)
            audio_path = self._get_audio_path(clip)
            if not audio_path:
                continue
            
            # Add input
            audio_inputs.append(ffmpeg.input(audio_path))
            
            # Calculate timing
            clip_start = clip.get("startTime", 0) if isinstance(clip, dict) else (getattr(clip, "startTime", 0) if hasattr(clip, "startTime") else 0)
            clip_duration = clip.get("duration", 0) if isinstance(clip, dict) else (getattr(clip, "duration", 0) if hasattr(clip, "duration") else 0)
            
            start_offset = clip_start
            duration = clip_duration
            
            # Volume adjustment
            volume = track.get("volume", 1.0) if isinstance(track, dict) else (getattr(track, "volume", 1.0) if hasattr(track, "volume") else 1.0)
            volume_db = 20 * (volume - 1.0) if volume < 1.0 else 0
            
            # Build filter
            filter_parts.append(
                f"[{idx}:a]"
                f"adelay={int(start_offset * 1000)}|{int(start_offset * 1000)}"
                f",volume={volume_db}dB"
                f"[a{idx}]"
            )
        
        # Mix all audio streams
        if len(filter_parts) > 1:
            mix_inputs = "".join([f"[a{i}]" for i in range(len(filter_parts))])
            filter_complex = ";".join(filter_parts) + f";{mix_inputs}amix=inputs={len(filter_parts)}:duration=longest[aout]"
        else:
            filter_complex = filter_parts[0] if filter_parts else ""
            filter_complex = filter_complex.replace("[a0]", "[aout]")
        
        # Build FFmpeg command
        if filter_complex:
            stream = ffmpeg.output(
                *audio_inputs,
                self.output_path,
                v="error",
                acodec="aac",
                ar=self.sample_rate,
                ac=2,  # Stereo
                filter_complex=filter_complex,
                map="[aout]",
            )
        else:
            # Single audio input, no mixing needed
            stream = audio_inputs[0].output(
                self.output_path,
                v="error",
                acodec="aac",
                ar=self.sample_rate,
                ac=2,
            )
        
        ffmpeg.run(stream, overwrite_output=True, quiet=True)
        
        return self.output_path
    
    def _get_audio_path(self, clip: Any) -> str:
        """Get audio file path from clip"""
        # Handle dict or object
        if isinstance(clip, dict):
            # Check if clip has voice audio
            if clip.get("voiceJobId"):
                # Resolve from job output
                # TODO: Fetch from job output
                pass
            
            # Check clip audio track
            if clip.get("audioTrack"):
                return clip["audioTrack"].get("filePath", "")
        else:
            # Check if clip has voice audio
            if hasattr(clip, "voiceJobId") and clip.voiceJobId:
                # Resolve from job output
                # TODO: Fetch from job output
                pass
            
            # Check clip audio track
            if hasattr(clip, "audioTrack") and clip.audioTrack:
                if isinstance(clip.audioTrack, dict):
                    return clip.audioTrack.get("filePath", "")
                elif hasattr(clip.audioTrack, "filePath"):
                    return clip.audioTrack.filePath
        
        return None
    
    def _generate_silence(self, duration: float = 1.0) -> str:
        """Generate silence audio"""
        silence_path = os.path.join(tempfile.gettempdir(), f"silence_{uuid.uuid4()}.wav")
        (
            ffmpeg
            .input("anullsrc", format="lavfi", r=self.sample_rate, ac=2)
            .output(silence_path, t=duration, acodec="pcm_s16le")
            .overwrite_output()
            .run(quiet=True)
        )
        return silence_path

