import { FastifyInstance } from "fastify";
import type { JobType, JobStatus } from "@shared/types/jobs";

export async function createJob(
  fastify: FastifyInstance,
  userId: string,
  type: JobType,
  input: any,
  projectId?: string,
  idempotencyKey?: string
) {
  // Create job in database
  const job = await fastify.prisma.job.create({
    data: {
      userId,
      projectId,
      type,
      status: "queued",
      input,
      progress: 0,
      idempotencyKey,
    },
  });

  // Add to BullMQ queue
  await fastify.jobQueue.add(
    type,
    {
      jobId: job.id,
      userId,
      projectId,
      type,
      input,
    },
    {
      jobId: job.id,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );

  return job;
}

export async function updateJobStatus(
  fastify: FastifyInstance,
  jobId: string,
  update: {
    progress: number;
    status: JobStatus;
    output?: any;
    error?: string;
  }
) {
  const updateData: any = {
    progress: update.progress,
    status: update.status,
  };

  if (update.output) {
    updateData.output = update.output;
  }

  if (update.error) {
    updateData.error = update.error;
  }

  if (update.status === "processing" && !updateData.startedAt) {
    updateData.startedAt = new Date();
  }

  if (update.status === "completed" || update.status === "failed") {
    updateData.completedAt = new Date();
  }

  const job = await fastify.prisma.job.update({
    where: { id: jobId },
    data: updateData,
  });

  return job;
}

