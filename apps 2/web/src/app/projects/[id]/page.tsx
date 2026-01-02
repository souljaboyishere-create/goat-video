"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VideoEditor from "@/components/VideoEditor";
import { useJobStatus } from "@/hooks/useJobStatus";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const projectId = params.id;
  const { jobs, refreshJobs, deleteJob } = useJobStatus(projectId);

  useEffect(() => {
    if (!projectId) return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load project:", err);
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center pt-16 md:pt-20">
        <div className="card rounded-lg p-6 text-cream text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber mx-auto"></div>
          <p className="mt-2 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center pt-16 md:pt-20">
        <div className="card rounded-lg p-6 text-cream text-center">
          <p className="text-sm">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 flex-shrink-0 bg-charcoal-light/80 backdrop-blur-md border-b border-cream/10 text-cream px-4 flex items-center justify-between safe-top">
        <h1 className="font-serif text-sm font-bold truncate">{project.name}</h1>
        <Link
          href="/projects"
          className="text-xs text-text-secondary hover:text-cream transition min-h-touch min-w-touch flex items-center"
        >
          ← Back
        </Link>
      </header>

      {/* Editor - remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
      <VideoEditor project={project} jobs={jobs} onRefresh={refreshJobs} onDeleteJob={deleteJob} />
      </div>
    </div>
  );
}
