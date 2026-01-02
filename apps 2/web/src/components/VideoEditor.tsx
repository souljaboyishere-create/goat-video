"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Timeline from "./Timeline";
import VideoPreview from "./VideoPreview";
import JobStatusBar from "./JobStatusBar";
import EditorToolbar from "./EditorToolbar";

interface VideoEditorProps {
  project: any;
  jobs: any[];
  onRefresh?: () => void;
  onDeleteJob?: (jobId: string) => Promise<void>;
}

export default function VideoEditor({ project, jobs, onRefresh, onDeleteJob }: VideoEditorProps) {
  const [timeline, setTimeline] = useState(() => project.timeline || {
    version: "1.0",
    format: project.format,
    duration: 0,
    tracks: [],
    scenes: [],
    settings: {
      fps: 30,
      resolution: {
        width: project.format === "16:9" ? 1920 : 1080,
        height: project.format === "16:9" ? 1080 : 1920,
      },
    },
  });
  
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const processedJobsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (project.timeline && JSON.stringify(project.timeline) !== JSON.stringify(timeline)) {
      setTimeline(project.timeline);
      processedJobsRef.current.clear();
    }
  }, [project.timeline]);

  useEffect(() => {
    const completedDownloads = jobs.filter(
      (job) => job.type === "video_download" && job.status === "completed" && job.output && !processedJobsRef.current.has(job.id)
    );

    if (completedDownloads.length > 0) {
      completedDownloads.forEach((downloadJob) => {
        const output = downloadJob.output as any;

        if (output.filePath) {
          processedJobsRef.current.add(downloadJob.id);

          setTimeline((prevTimeline) => {
            const existingClip = prevTimeline.tracks
              .flatMap((t: any) => t.clips || [])
              .find((c: any) => c.clipId === downloadJob.id);
            
            if (existingClip) {
              return prevTimeline;
            }

            const newClip = {
              id: `clip-${downloadJob.id}-${Date.now()}`,
              clipId: downloadJob.id,
              startTime: prevTimeline.duration,
              duration: output.duration || 0,
              sourceStartTime: 0,
              sourceEndTime: output.duration || 0,
              transformations: [],
            };

            const tracks = [...prevTimeline.tracks];
            let videoTrack = tracks.find((t: any) => t.type === "video");
            if (!videoTrack) {
              videoTrack = {
                id: `track-${Date.now()}`,
                type: "video",
                clips: [],
              };
              tracks.push(videoTrack);
            } else {
              const trackIndex = tracks.indexOf(videoTrack);
              videoTrack = {
                ...videoTrack,
                clips: [...videoTrack.clips],
              };
              tracks[trackIndex] = videoTrack;
            }

            videoTrack.clips.push(newClip);

            return {
              ...prevTimeline,
              duration: prevTimeline.duration + (output.duration || 0),
              tracks,
            };
          });

          setSelectedClipId((prev) => prev || downloadJob.id);
        }
      });
    }
  }, [jobs]);

  const handleTimelineUpdate = useCallback((newTimeline: any) => {
    setTimeline(newTimeline);
  }, []);

  const handleVideoAdded = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  const handleClipSelect = useCallback((clipId: string) => {
    setSelectedClipId(clipId);
  }, []);

  const handleCloseVideo = useCallback(() => {
    setSelectedClipId(null);
  }, []);

  const hasActiveJobs = jobs.some(
    (job) => job.status === "queued" || job.status === "processing" || job.status === "failed"
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar - fixed */}
      <EditorToolbar projectId={project.id} onVideoAdded={handleVideoAdded} />

      {/* Preview Area - flexible but constrained */}
      <div className="flex-1 min-h-0 bg-black/40 overflow-hidden relative">
        <VideoPreview 
          timeline={timeline} 
          jobs={jobs} 
          selectedClipId={selectedClipId}
          onClose={handleCloseVideo}
        />
      </div>

      {/* Job Status Bar */}
      {hasActiveJobs && <JobStatusBar jobs={jobs} onDeleteJob={onDeleteJob} />}

      {/* Timeline - fixed 40px */}
      <div className="h-10 flex-shrink-0 bg-charcoal-light/80 backdrop-blur-md border-t border-cream/10">
        <Timeline 
          timeline={timeline} 
          onUpdate={handleTimelineUpdate}
          selectedClipId={selectedClipId}
          onClipSelect={handleClipSelect}
        />
      </div>
    </div>
  );
}
