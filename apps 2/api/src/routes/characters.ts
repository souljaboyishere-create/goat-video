import { FastifyInstance } from "fastify";
import { z } from "zod";
import { setupAuth } from "./auth.js";

const createCharacterSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["historical", "avatar", "custom"]),
  faceModel: z.string().optional(),
  faceEmbeddingUrl: z.string().optional(),
  voiceProfile: z.string().optional(),
  appearanceConfig: z.any(),
  metadata: z.any().optional(),
});

const updateCharacterSchema = z.object({
  name: z.string().min(1).optional(),
  appearanceConfig: z.any().optional(),
  metadata: z.any().optional(),
});

export default async function characterRoutes(fastify: FastifyInstance) {
  // Setup auth
  await setupAuth(fastify);

  // Create character
  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const body = createCharacterSchema.parse(request.body);

      const character = await fastify.prisma.character.create({
        data: {
          userId: request.userId!,
          name: body.name,
          type: body.type,
          faceModel: body.faceModel,
          faceEmbeddingUrl: body.faceEmbeddingUrl,
          voiceProfile: body.voiceProfile,
          appearanceConfig: body.appearanceConfig,
          metadata: body.metadata,
        },
      });

      return character;
    }
  );

  // Get all characters for user
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const characters = await fastify.prisma.character.findMany({
        where: { userId: request.userId! },
        orderBy: { createdAt: "desc" },
      });

      return { characters };
    }
  );

  // Get character by ID
  fastify.get(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const character = await fastify.prisma.character.findFirst({
        where: {
          id,
          userId: request.userId!,
        },
      });

      if (!character) {
        return reply.code(404).send({ error: "Character not found" });
      }

      return character;
    }
  );

  // Update character
  fastify.patch(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateCharacterSchema.parse(request.body);

      const character = await fastify.prisma.character.findFirst({
        where: {
          id,
          userId: request.userId!,
        },
      });

      if (!character) {
        return reply.code(404).send({ error: "Character not found" });
      }

      const updated = await fastify.prisma.character.update({
        where: { id },
        data: body,
      });

      return updated;
    }
  );

  // Delete character
  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const character = await fastify.prisma.character.findFirst({
        where: {
          id,
          userId: request.userId!,
        },
      });

      if (!character) {
        return reply.code(404).send({ error: "Character not found" });
      }

      await fastify.prisma.character.delete({
        where: { id },
      });

      return { success: true };
    }
  );
}

