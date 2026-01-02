"""
Timeline Resolver
Converts declarative timeline JSON into frame-level execution plan
"""

from typing import List, Dict, Any
# Timeline types will be passed as dict from backend


class ResolvedFrame:
    """Single frame execution plan"""
    def __init__(self):
        self.frame_number: int = 0
        self.timestamp: float = 0.0
        self.video_clips: List[Dict] = []  # Video clips active at this frame
        self.audio_clips: List[Dict] = []  # Audio clips active at this frame
        self.subtitles: List[Dict] = []  # Subtitles active at this frame
        self.transformations: List[Dict] = []  # Transformations to apply


class TimelineResolver:
    """Resolves timeline into frame-by-frame execution plan"""
    
    def __init__(self, timeline: Dict, fps: float = 30.0):
        self.timeline = timeline
        self.fps = fps
        self.total_frames = int(timeline.get("duration", 0) * fps)
    
    def resolve(self) -> List[ResolvedFrame]:
        """Convert timeline to frame-level plan"""
        frames = []
        
        for frame_num in range(self.total_frames):
            timestamp = frame_num / self.fps
            frame = ResolvedFrame()
            frame.frame_number = frame_num
            frame.timestamp = timestamp
            
            # Process each track
            for track in self.timeline.get("tracks", []):
                # Find clips active at this timestamp
                for clip in track.get("clips", []):
                    clip_start = clip.get("startTime", 0) if isinstance(clip, dict) else (getattr(clip, "startTime", 0) if hasattr(clip, "startTime") else 0)
                    clip_duration = clip.get("duration", 0) if isinstance(clip, dict) else (getattr(clip, "duration", 0) if hasattr(clip, "duration") else 0)
                    clip_end = clip_start + clip_duration
                    
                    if clip_start <= timestamp < clip_end:
                        track_type = track.get("type", "video")
                        if track_type == "video":
                            frame.video_clips.append({
                                "clip": clip,
                                "track": track,
                                "local_time": timestamp - clip_start,
                                "clipId": clip.get("clipId", "") if isinstance(clip, dict) else (getattr(clip, "clipId", "") if hasattr(clip, "clipId") else ""),
                            })
                        elif track_type == "audio":
                            frame.audio_clips.append({
                                "clip": clip,
                                "track": track,
                                "local_time": timestamp - clip_start,
                            })
                        elif track_type == "subtitle":
                            frame.subtitles.append({
                                "clip": clip,
                                "track": track,
                                "local_time": timestamp - clip_start,
                            })
            
            # Collect transformations from active clips
            for video_clip_data in frame.video_clips:
                clip = video_clip_data["clip"]
                for transform in clip.get("transformations", []):
                    if transform.get("status") == "completed":
                        frame.transformations.append({
                            "type": transform["type"],
                            "config": transform["config"],
                            "clip": clip,
                        })
            
            frames.append(frame)
        
        return frames
    
    def get_asset_dependencies(self) -> Dict[str, List[str]]:
        """Extract all asset dependencies from timeline"""
        dependencies = {
            "videos": [],
            "audio": [],
            "subtitles": [],
            "characters": [],
            "voices": [],
        }
        
        for track in self.timeline.get("tracks", []):
            for clip in track.get("clips", []):
                # Video dependencies
                track_type = track.get("type", "video")
                if track_type == "video":
                    dependencies["videos"].append(clip.get("clipId", ""))
                
                # Audio dependencies (voice clones)
                if clip.get("voiceId"):
                    dependencies["voices"].append(clip["voiceId"])
                if clip.get("voiceJobId"):
                    # Will be resolved from job output
                    pass
                
                # Character dependencies
                if clip.get("characterId"):
                    dependencies["characters"].append(clip["characterId"])
                
                # Subtitle dependencies
                if track_type == "subtitle":
                    dependencies["subtitles"].append(clip.get("clipId", ""))
        
        return dependencies

