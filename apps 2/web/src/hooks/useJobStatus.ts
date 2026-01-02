"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useJobStatus(projectId: string) {
  const [jobs, setJobs] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  const connectWebSocket = useCallback(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      // Convert http/https to ws/wss
      const wsUrl = apiUrl.replace(/^https?/, (match) => match === "https" ? "wss" : "ws") + `/ws?token=${token}`;
      
      isConnectingRef.current = true;
      const websocket = new WebSocket(wsUrl);
      const currentWsRef = wsRef; // Capture ref to check if this is still the active connection

      websocket.onopen = () => {
        // Only log if this is still the active connection
        if (currentWsRef.current === websocket) {
          console.log("WebSocket connected");
          isConnectingRef.current = false;
        }
      };

      websocket.onmessage = (event) => {
        // Only process messages if this is still the active connection
        if (currentWsRef.current !== websocket) {
          return;
        }
        try {
          const data = JSON.parse(event.data);
          if (data.type === "job_update") {
            setJobs((prev) =>
              prev.map((job) =>
                job.id === data.jobId
                  ? { ...job, progress: data.progress, status: data.status, error: data.error }
                  : job
              )
            );
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      websocket.onerror = (error) => {
        // Only log errors if this is still the active connection and not in cleanup
        if (currentWsRef.current === websocket && 
            websocket.readyState !== WebSocket.CLOSING && 
            websocket.readyState !== WebSocket.CLOSED) {
          console.error("WebSocket error:", error);
        }
        if (currentWsRef.current === websocket) {
          isConnectingRef.current = false;
        }
        // Don't reconnect immediately on error - let onclose handle it
      };

      websocket.onclose = (event) => {
        // Only handle close if this is still the active connection
        if (currentWsRef.current !== websocket) {
          return;
        }
        
        // Only log if it wasn't a clean close (code 1000)
        if (event.code !== 1000) {
          console.log("WebSocket disconnected", event.code, event.reason);
        }
        
        isConnectingRef.current = false;
        if (currentWsRef.current === websocket) {
          wsRef.current = null;
        }

        // Only reconnect if it wasn't a manual close (code 1000) or unauthorized (1008)
        if (event.code !== 1000 && event.code !== 1008) {
          // Reconnect after 3 seconds, but only if we still have a token and this is still the active connection
          if (localStorage.getItem("token") && currentWsRef.current === null) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, 3000);
          }
        }
      };

      wsRef.current = websocket;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      isConnectingRef.current = false;
    }
  }, []);

  const fetchJobs = useCallback(() => {
    if (!projectId) return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/api/jobs/project/${projectId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Merge new jobs with existing ones, keeping the most recent progress
        setJobs((prev) => {
          const newJobs = data.jobs || [];
          // Create a map of existing jobs by ID to preserve WebSocket updates
          const existingJobsMap = new Map(prev.map((job) => [job.id, job]));
          
          // Merge: use new jobs from API, but preserve progress from existing if it's more recent
          return newJobs.map((newJob: any) => {
            const existing = existingJobsMap.get(newJob.id);
            // If job exists and has progress, prefer existing progress if it's higher
            // (WebSocket updates are more real-time)
            if (existing && existing.progress !== undefined && newJob.progress !== undefined) {
              return {
                ...newJob,
                progress: Math.max(existing.progress, newJob.progress),
                status: newJob.status, // Always use latest status from API
              };
            }
            return newJob;
          });
        });
      })
      .catch((err) => console.error("Failed to load jobs:", err));
  }, [projectId]);

  useEffect(() => {
    // Fetch initial jobs
    fetchJobs();

    // Poll for job updates every 2 seconds
    const interval = setInterval(fetchJobs, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [projectId, fetchJobs]);

  // Connect WebSocket when component mounts and we have a projectId
  useEffect(() => {
    if (!projectId) {
      return;
    }

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Mark that we're intentionally closing (prevents reconnection)
      isConnectingRef.current = false;
      
      const ws = wsRef.current;
      if (ws) {
        // Remove all event handlers FIRST to prevent callbacks after cleanup
        // This prevents error handlers from firing
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = () => {}; // Set to no-op instead of null to prevent browser errors
        ws.onclose = null;
        
        // Only attempt to close if not already closed/closing
        // For CONNECTING state, we just null the ref - the connection will fail naturally
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.close(1000, "Component unmounting");
          } catch (e) {
            // Silently ignore - connection may have closed already
          }
        } else if (ws.readyState === WebSocket.CONNECTING) {
          // Don't call close() on CONNECTING sockets - just null the ref
          // The connection will fail naturally and the error handler is now a no-op
        }
        // For CLOSING or CLOSED states, do nothing
        
        wsRef.current = null;
      }
    };
  }, [projectId, connectWebSocket]);

  const deleteJob = useCallback(async (jobId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${apiUrl}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete job");
      }

      // Remove job from local state
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      
      // Refetch to sync with backend
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  }, [fetchJobs]);

  return { jobs, connectWebSocket, refreshJobs: fetchJobs, deleteJob };
}

