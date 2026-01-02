import { FastifyInstance } from "fastify";
import { z } from "zod";
import { setupAuth } from "./auth.js";

const createVoiceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["cloned", "preset", "synthetic"]),
  sourceAudio: z.string().optional(),
  language: z.string().default("en"),
  emotion: z.string().optional(),
  style: z.string().optional(),
  embeddingUrl: z.string().optional(),
  modelVersion: z.string().optional(),
  metadata: z.any().optional(),
});

const updateVoiceSchema = z.object({
  name: z.string().min(1).optional(),
  emotion: z.string().optional(),
  style: z.string().optional(),
  metadata: z.any().optional(),
});

export default async function voiceRoutes(fastify: FastifyInstance) {
  // Setup auth
  await setupAuth(fastify);

  // Create voice
  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const body = createVoiceSchema.parse(request.body);

      const voice = await fastify.prisma.voice.create({
        data: {
          userId: request.userId!,
          name: body.name,
          type: body.type,
          sourceAudio: body.sourceAudio,
          language: body.language,
          emotion: body.emotion,
          style: body.style,
          embeddingUrl: body.embeddingUrl,
          modelVersion: body.modelVersion,
          metadata: body.metadata,
        },
      });

      return voice;
    }
  );

  // Get all voices for user
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const voices = await fastify.prisma.voice.findMany({
        where: { userId: request.userId! },
        orderBy: { createdAt: "desc" },
      });

      return { voices };
    }
  );

  // Get voice by ID
  fastify.get(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const voice = await fastify.prisma.voice.findFirst({
        where: {
          id,
          userId: request.userId!,
        },
      });

      if (!voice) {
        return reply.code(404).send({ error: "Voice not found" });
      }

      return voice;
    }
  );

  // Update voice
  fastify.patch(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateVoiceSchema.parse(request.body);

      const voice = await fastify.prisma.voice.findFirst({
        where: {
          id,
          userId: request.userId!,
        },
      });

      if (!voice) {
        return reply.code(404).send({ error: "Voice not found" });
      }

      const updated = await fastify.prisma.voice.update({
        where: { id },
        data: body,
      });

      return updated;
    }
  );

  // Delete voice
  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const voice = await fastify.prisma.voice.findFirst({
        where: {
          id,
          userId: request.userId!,
        },
      });

      if (!voice) {
        return reply.code(404).send({ error: "Voice not found" });
      }

      await fastify.prisma.voice.delete({
        where: { id },
      });

      return { success: true };
    }
  );
}

