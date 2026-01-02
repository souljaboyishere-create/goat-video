"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../../../components/Card";
import Button from "../../../components/Button";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login
      window.location.href = "/login";
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.error || errorData.message || `Failed to create project (${response.status})`);
      }

      const project = await response.json();
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      console.error("Project creation error:", err);
      setError(err.message || "Failed to create project. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-y-auto p-2 sm:p-4 flex items-center justify-center pt-16 md:pt-20">
      <div className="max-w-2xl w-full my-8 animate-fade-in">
        <div className="mb-6">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-cream mb-2">Create New Project</h1>
          <p className="text-sm text-text-secondary">Start a new AI video creation project</p>
        </div>

        <Card grain>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-amber/20 border border-amber/50 text-amber p-4 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-cream font-medium mb-2 text-sm">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-charcoal-light border border-cream/10 text-cream rounded-lg focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/50 text-sm"
                placeholder="My Awesome Video"
              />
            </div>

            <div>
              <label className="block text-cream font-medium mb-2 text-sm">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-charcoal-light border border-cream/10 text-cream rounded-lg focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/50 text-sm resize-none"
                placeholder="Describe your project..."
              />
            </div>

            <div>
              <label className="block text-cream font-medium mb-3 text-sm">
                Video Format *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["16:9", "9:16", "1:1"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`
                      px-3 py-3 rounded-lg border-2 transition-all text-sm font-semibold min-h-touch
                      ${
                        format === fmt
                          ? "border-amber bg-amber/20 text-cream"
                          : "border-cream/10 bg-charcoal-light text-text-secondary hover:border-cream/20"
                      }
                    `}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !name}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Project"}
              </Button>
              <Link href="/projects">
                <Button variant="secondary">Cancel</Button>
              </Link>
            </div>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/projects"
            className="text-text-muted hover:text-cream transition text-sm"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    </main>
  );
}

