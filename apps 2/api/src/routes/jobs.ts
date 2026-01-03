import { FastifyInstance } from "fastify";
import { z } from "zod";
import { setupAuth } from "./auth.js";
import { createJob, updateJobStatus } from "../services/jobService.js";
import type { JobType } from "@shared/types/jobs";

const createJobSchema = z.object({
  projectId: z.string().uuid().optional().nullable(),
  type: z.enum([
    "video_download",
    "clip_edit",
    "face_transform",
    "voice_clone",
    "lip_sync",
    "subtitle_generate",
    "background_replace",
    "render",
  ]),
  input: z.any(),
  idempotencyKey: z.string().optional(),
});

export default async function jobRoutes(fastify: FastifyInstance) {
  // Setup auth
  await setupAuth(fastify);

  // Create job
  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const body = createJobSchema.parse(request.body);

        // Check idempotency
        if (body.idempotencyKey) {
          const existing = await fastify.prisma.job.findUnique({
            where: { idempotencyKey: body.idempotencyKey },
          });

          if (existing && existing.status !== "failed") {
            return existing;
          }
        }

        const job = await createJob(
          fastify,
          request.userId!,
          body.type as JobType,
          body.input,
          body.projectId,
          body.idempotencyKey
        );

        return job;
      } catch (error: any) {
        fastify.log.error("Error creating job:", error);
        return reply.code(500).send({
          error: error.message || "Failed to create job",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }
  );

  // Get job by ID
  fastify.get(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const job = await fastify.prisma.job.findFirst({
        where: {
          id,
          userId: request.userId!,
        },
      });

      if (!job) {
        return reply.code(404).send({ error: "Job not found" });
      }

      return job;
    }
  );

  // Get jobs for project
  fastify.get(
    "/project/:projectId",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { projectId } = request.params as { projectId: string };

        const jobs = await fastify.prisma.job.findMany({
          where: {
            projectId,
            userId: request.userId!,
          },
          orderBy: { createdAt: "desc" },
        });

        return { jobs };
      } catch (error: any) {
        fastify.log.error("Error fetching jobs:", error);
        return reply.code(500).send({
          error: error.message || "Failed to fetch jobs",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }
  );

  // Worker status update endpoint (protected by API key)
  fastify.post("/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };
    const apiKey = request.headers["x-worker-api-key"] || "";
    const expectedKey = process.env.WORKER_API_KEY || "";

    // Allow empty API key in development or if not set
    if (expectedKey && apiKey !== expectedKey) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const body = z
      .object({
        progress: z.number().min(0).max(100),
        status: z.enum(["processing", "completed", "failed"]),
        output: z.any().optional(),
        error: z.string().nullable().optional(),
      })
      .parse(request.body);

    const job = await updateJobStatus(fastify, id, body);

    // Emit WebSocket update
    const wsConnections = (fastify as any).wsConnections;
    if (wsConnections) {
      wsConnections.forEach((socket: any) => {
        if (socket.readyState === 1) {
          // WebSocket.OPEN
          socket.send(
            JSON.stringify({
              type: "job_update",
              jobId: id,
              progress: body.progress,
              status: body.status,
              error: body.error,
            })
          );
        }
      });
    }

    return job;
  });

  // Delete job
  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };

        const job = await fastify.prisma.job.findFirst({
          where: {
            id,
            userId: request.userId!,
          },
        });

        if (!job) {
          return reply.code(404).send({ error: "Job not found" });
        }

        // Only allow deleting queued or failed jobs (not processing or completed)
        if (job.status === "processing" || job.status === "completed") {
          return reply.code(400).send({ 
            error: "Cannot delete processing or completed jobs" 
          });
        }

        await fastify.prisma.job.delete({
          where: { id },
        });

        return { success: true };
      } catch (error: any) {
        fastify.log.error("Error deleting job:", error);
        return reply.code(500).send({
          error: error.message || "Failed to delete job",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }
  );
}

