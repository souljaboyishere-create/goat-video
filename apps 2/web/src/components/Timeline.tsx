"use client";

import { memo } from "react";
import { Timeline as TimelineType } from "@/shared/types/timeline";

interface TimelineProps {
  timeline: TimelineType;
  onUpdate: (timeline: TimelineType) => void;
  selectedClipId?: string | null;
  onClipSelect?: (clipId: string) => void;
}

function Timeline({ timeline, onUpdate, selectedClipId, onClipSelect }: TimelineProps) {
  const clips = timeline.tracks.flatMap((t: any) => t.clips || []);

  return (
    <div className="h-full px-3 flex items-center gap-2 text-cream overflow-hidden">
      {clips.length === 0 ? (
        <span className="text-text-muted text-xs">No clips - Download a video to start</span>
        ) : (
        clips.map((clip: any, idx: number) => {
          const isSelected = clip.clipId === selectedClipId;
          return (
            <button
              key={clip.id || idx}
              onClick={() => onClipSelect?.(clip.clipId)}
              className={`
                px-3 py-1.5 rounded text-xs whitespace-nowrap font-medium flex-shrink-0 transition-colors min-h-touch
                ${isSelected 
                  ? "bg-amber text-charcoal" 
                  : "bg-cream/10 text-text-secondary hover:bg-cream/20 hover:text-cream"
                }
              `}
            >
              Clip {idx + 1} • {clip.duration?.toFixed(0)}s
            </button>
          );
        })
      )}
    </div>
  );
}

export default memo(Timeline);
