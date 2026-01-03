/**
 * Worker Processor
 * Dispatches jobs from BullMQ queue to worker HTTP endpoints
 */

import { Worker } from "bullmq";
import type { Job as BullJob } from "bullmq";
import { Redis } from "ioredis";
import { FastifyInstance } from "fastify";
import type { JobType } from "@shared/types/jobs";
import { updateJobStatus } from "./jobService.js";

// Worker endpoints configuration
const WORKER_ENDPOINTS: Record<JobType, string> = {
  video_download: process.env.VIDEO_DOWNLOADER_URL || "http://localhost:8000",
  voice_clone: process.env.VOICE_CLONER_URL || "http://localhost:8001",
  clip_edit: process.env.VIDEO_EDITOR_URL || "http://localhost:8002",
  face_transform: process.env.FACE_TRANSFORMER_URL || "http://localhost:8003",
  lip_sync: process.env.LIP_SYNC_URL || "http://localhost:8004",
  subtitle_generate: process.env.SUBTITLE_GENERATOR_URL || "http://localhost:8005",
  background_replace: process.env.BACKGROUND_REPLACER_URL || "http://localhost:8006",
  render: process.env.VIDEO_RENDERER_URL || "http://localhost:8007",
};

const WORKER_API_KEY = process.env.WORKER_API_KEY || "";

export function createWorkerProcessor(fastify: FastifyInstance, redis: Redis) {
  const worker = new Worker(
    "video-ai-jobs",
    async (job: BullJob) => {
      const { jobId, userId, projectId, type, input } = job.data;

      // Get worker endpoint
      const workerUrl = WORKER_ENDPOINTS[type as JobType];
      if (!workerUrl) {
        throw new Error(`No worker endpoint configured for job type: ${type}`);
      }

      fastify.log.info(`Dispatching job ${jobId} to ${workerUrl}`);

      // Call worker /execute endpoint
      const response = await fetch(`${workerUrl}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Worker-API-Key": WORKER_API_KEY,
        },
        body: JSON.stringify({
          jobId,
          type,
          input: {
            ...input,
            userId,
            projectId,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Worker rejected job: ${error}`);
      }

      const result = await response.json() as { status: string; jobId?: string };
      fastify.log.info(`Job ${jobId} accepted by worker: ${result.status}`);

      return result;
    },
    {
      connection: redis,
      concurrency: 5, // Process up to 5 jobs concurrently
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
      },
      removeOnFail: {
        count: 1000, // Keep last 1000 failed jobs
      },
    }
  );

  worker.on("completed", (job: BullJob) => {
    fastify.log.info(`Job ${job.id} completed`);
  });

  worker.on("failed", async (job: BullJob | undefined, err: Error) => {
    if (!job) {
      fastify.log.error(`Job failed but job data is missing: ${err.message}`);
      return;
    }

    const jobId = job.data?.jobId || job.id;
    const errorMessage = err.message || "Job processing failed";

    fastify.log.error(`Job ${jobId} failed: ${errorMessage}`);

    try {
      // Update database job status
      await updateJobStatus(fastify, jobId, {
        progress: 0,
        status: "failed",
        error: errorMessage,
      });

      // Broadcast WebSocket update
      const wsConnections = (fastify as any).wsConnections;
      if (wsConnections) {
        wsConnections.forEach((socket: any) => {
          if (socket.readyState === 1) {
            // WebSocket.OPEN
            socket.send(
              JSON.stringify({
                type: "job_update",
                jobId: jobId,
                progress: 0,
                status: "failed",
                error: errorMessage,
              })
            );
          }
        });
      }
    } catch (updateError: any) {
      fastify.log.error(`Failed to update job status for ${jobId}: ${updateError.message}`);
    }
  });

  worker.on("error", (err: Error) => {
    fastify.log.error(`Worker error: ${err.message}`);
  });

  return worker;
}

