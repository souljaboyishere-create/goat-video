"use client";

import { useState } from "react";

interface EditorToolbarProps {
  projectId: string;
  onVideoAdded: () => void;
}

export default function EditorToolbar({ projectId, onVideoAdded }: EditorToolbarProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadVideo = async () => {
    if (!videoUrl.trim()) {
      setError("Please enter a video URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to download videos");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: projectId || undefined,
          type: "video_download",
          input: {
            url: videoUrl.trim(),
            quality: "best",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.error || errorData.message || `Failed to download video (${response.status})`);
      }

      const jobData = await response.json();
      console.log("Job created:", jobData);

      setShowDownloadModal(false);
      setVideoUrl("");
      onVideoAdded();
    } catch (err: any) {
      console.error("Download error:", err);
      setError(err.message || "Failed to download video. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="glass-strong border-b border-white/10 px-2 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowDownloadModal(true)}
            className="accent-gradient text-black px-2 py-1 rounded text-xs font-semibold transition-all hover:scale-105 flex items-center gap-1 shadow-md"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
          <button
            className="glass border border-white/10 text-white/50 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload
          </button>
          <button
            className="glass border border-white/10 text-white/50 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Voice
          </button>
          <button
            className="glass border border-white/10 text-white/50 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Face
          </button>
          <button
            className="glass border border-white/10 text-white/50 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            Subs
          </button>
          <button
            className="glass border border-white/10 text-white/50 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Render
          </button>
        </div>
      </div>

      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-lg p-4 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-white">Download Video</h2>
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setError(null);
                  setVideoUrl("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-2 rounded mb-3 text-xs">
                {error}
              </div>
            )}

            <div className="mb-3">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste video URL..."
                className="w-full px-3 py-2 glass border border-white/10 text-white rounded focus:border-accent-primary focus:outline-none text-sm"
                onKeyPress={(e) => e.key === "Enter" && handleDownloadVideo()}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                YouTube, Rumble, Twitter/X, TikTok, Instagram
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadVideo}
                disabled={loading || !videoUrl.trim()}
                className="flex-1 accent-gradient text-black px-3 py-1.5 rounded text-sm font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
              >
                {loading ? "..." : "Download"}
              </button>
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setError(null);
                  setVideoUrl("");
                }}
                className="px-3 py-1.5 glass border border-white/10 hover:bg-white/10 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
