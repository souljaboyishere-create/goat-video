"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "../../components/Card";
import Button from "../../components/Button";

interface Project {
  id: string;
  name: string;
  description: string | null;
  format: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login instead of showing error
      window.location.href = "/login";
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/api/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            setError("Please log in to view projects");
            return [];
          }
          throw new Error("Failed to load projects");
        }
        return res.json();
      })
      .then((data) => {
        setProjects(data.projects || data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center pt-20 md:pt-24">
        <Card>
          <div className="text-center text-cream">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber mx-auto"></div>
            <p className="mt-4">Loading projects...</p>
          </div>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center pt-20 md:pt-24">
        <div className="max-w-md w-full">
          <Card>
            <div className="bg-amber/20 border border-amber/50 text-amber p-4 rounded-lg mb-4">
              {error}
            </div>
            <Link href="/">
              <Button variant="primary">← Back to Home</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden p-2 sm:p-4 flex flex-col relative pt-20 md:pt-24">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in pt-8 md:pt-12">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-cream mb-2">My Projects</h1>
              <p className="text-sm text-text-secondary">Manage your AI video projects</p>
            </div>
            <Link href="/projects/new">
              <Button variant="primary" className="whitespace-nowrap">
                + New Project
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <Card grain className="text-center animate-slide-up">
              <div className="text-text-muted mb-4">
                <svg
                  className="mx-auto h-16 w-16 mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-semibold text-cream mb-2">
                No projects yet
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                Get started by creating your first AI video project
              </p>
              <Link href="/projects/new">
                <Button variant="primary">Create Your First Project</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, idx) => {
                const staggerClass = (idx % 3) === 0 ? "animate-stagger-1" : (idx % 3) === 1 ? "animate-stagger-2" : "animate-stagger-3";
                return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={staggerClass}
                >
                  <Card hover grain className="h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-bold text-cream truncate flex-1">
                        {project.name}
                      </h3>
                      <span className="ml-2 px-2 py-1 text-xs bg-amber text-charcoal rounded font-semibold whitespace-nowrap">
                        {project.format}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="text-text-muted text-xs">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </Card>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

