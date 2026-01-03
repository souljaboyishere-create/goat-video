"use client";

import { useState } from "react";

interface JobStatusBarProps {
  jobs: any[];
  onDeleteJob?: (jobId: string) => void;
}

export default function JobStatusBar({ jobs, onDeleteJob }: JobStatusBarProps) {
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  // Filter to show: active jobs (queued/processing) and failed jobs
  const activeJobs = jobs.filter(
    (job) => job.status === "queued" || job.status === "processing"
  );
  const failedJobs = jobs.filter(
    (job) => job.status === "failed"
  );

  // Filter out stuck jobs (queued/processing for more than 5 minutes with 0% progress)
  const now = Date.now();
  const validActiveJobs = activeJobs.filter((job) => {
    const jobAge = now - new Date(job.createdAt).getTime();
    const isStuck = jobAge > 5 * 60 * 1000 && job.progress === 0;
    return !isStuck;
  });

  const handleDelete = async (jobId: string) => {
    if (!onDeleteJob) return;
    setDeleting((prev) => new Set(prev).add(jobId));
    try {
      await onDeleteJob(jobId);
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  if (validActiveJobs.length === 0 && failedJobs.length === 0) {
    return null;
  }

  return (
    <div className="glass-strong border-t border-white/10 p-2 flex-shrink-0 max-h-32 overflow-y-auto">
      {validActiveJobs.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber whitespace-nowrap">Processing:</span>
            {validActiveJobs.map((job) => (
              <div key={job.id} className="flex items-center gap-2 bg-charcoal/60 border border-amber/30 px-2 py-1 rounded-lg">
                <span className="text-xs whitespace-nowrap font-medium text-cream">{job.type}</span>
                <div className="w-16 bg-black/30 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber h-full rounded-full transition-all"
                    style={{ width: `${Math.max(job.progress || 0, 2)}%` }}
                  />
                </div>
                <span className="text-xs whitespace-nowrap font-medium text-cream">{job.progress || 0}%</span>
                {(job.status === "queued" || (job.status === "processing" && job.progress === 0)) && (
                  <button
                    onClick={() => handleDelete(job.id)}
                    disabled={deleting.has(job.id)}
                    className="ml-1 text-red-400 hover:text-red-300 text-sm font-bold transition"
                    title="Cancel job"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {failedJobs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-red-400 whitespace-nowrap">Failed:</span>
            {failedJobs.map((job) => (
              <div key={job.id} className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-lg group">
                <span className="text-xs whitespace-nowrap font-medium">{job.type}</span>
                {job.error && (
                  <span className="text-xs text-red-300 max-w-xs truncate" title={job.error}>
                    {job.error.substring(0, 30)}...
                  </span>
                )}
                <button
                  onClick={() => handleDelete(job.id)}
                  disabled={deleting.has(job.id)}
                  className="ml-1 text-red-400 hover:text-red-300 text-sm font-bold opacity-0 group-hover:opacity-100 transition"
                  title="Delete job"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

