"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timeline as TimelineType } from "@/shared/types/timeline";

interface VideoPreviewProps {
  timeline: TimelineType;
  jobs: any[];
  selectedClipId: string | null;
  onClose?: () => void;
}

export default function VideoPreview({ timeline, jobs, selectedClipId, onClose }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lastFetchedClipId = useRef<string | null>(null);

  // Only use first clip if no clip has ever been selected
  // If selectedClipId is explicitly null (after closing), don't show anything
  const activeClipId = selectedClipId;

  const activeJob = jobs.find(
    (j) => j.id === activeClipId && j.status === "completed" && j.output?.filePath
  );

  useEffect(() => {
    if (lastFetchedClipId.current === activeClipId && videoUrl) return;
    if (!activeClipId || !activeJob) {
      setVideoUrl(null);
      return;
    }

    const fetchVideoUrl = async () => {
      setLoading(true);
      setError(null);
      lastFetchedClipId.current = activeClipId;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("Please log in");
          return;
        }

        const response = await fetch(
          `${apiUrl}/api/media/url?path=${encodeURIComponent(activeJob.output.filePath)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Failed to load");
        const data = await response.json();
        setVideoUrl(data.url);
      } catch {
        setError("Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoUrl();
  }, [activeClipId, activeJob]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    onClose?.();
  }, [onClose]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-2">
      {/* Video - constrained to max 400px height */}
      <div className="flex-1 w-full flex items-center justify-center" style={{ maxHeight: "400px" }}>
        {timeline.duration === 0 ? (
          <div className="text-gray-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">No video</p>
          </div>
        ) : loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div>
        ) : error ? (
          <div className="text-red-400 text-xs">{error}</div>
        ) : videoUrl ? (
          <div className="relative">
            <video
              ref={videoRef}
              className="max-w-full max-h-full rounded shadow-lg cursor-pointer"
              style={{ maxHeight: "380px" }}
              onClick={handlePlayPause}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playsInline
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>

            
            {/* Big play button overlay - only when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
        </div>
      ) : (
          <div className="text-gray-500 text-xs">Select a clip</div>
        )}
      </div>

      {/* Controls */}
      {videoUrl && duration > 0 && (
        <div className="w-full max-w-lg mt-2 flex items-center gap-1 px-1">
          {/* Skip backward */}
          <button
            onClick={() => handleSkip(-10)}
            className="px-1.5 py-0.5 rounded text-[10px] text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
            aria-label="Skip back 10 seconds"
          >
            -10s
          </button>

          {/* Time display */}
          <span className="text-white text-[10px] font-mono w-8">{formatTime(currentTime)}</span>

          {/* Progress bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent-primary) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%)`,
            }}
          />

          {/* Duration display */}
          <span className="text-gray-400 text-[10px] font-mono w-8 text-right">{formatTime(duration)}</span>

          {/* Skip forward */}
          <button
            onClick={() => handleSkip(10)}
            className="px-1.5 py-0.5 rounded text-[10px] text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
            aria-label="Skip forward 10 seconds"
          >
            +10s
          </button>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="ml-2 px-1.5 py-0.5 rounded text-[10px] text-gray-300 hover:text-white hover:bg-red-500/20 transition-colors font-medium"
            aria-label="Close video"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
