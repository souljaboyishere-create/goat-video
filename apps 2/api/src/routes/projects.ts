import { FastifyInstance } from "fastify";
import { z } from "zod";
import { setupAuth } from "./auth.js";

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  format: z.enum(["9:16", "16:9", "1:1"]),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  timeline: z.any().optional(),
  settings: z.any().optional(),
});

export default async function projectRoutes(fastify: FastifyInstance) {
  // Setup auth
  await setupAuth(fastify);

  // Create project
  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        fastify.log.info("Creating project", { body: request.body, userId: request.userId });
        const body = createProjectSchema.parse(request.body);

        // Create default timeline
        const defaultTimeline = {
          version: "1.0",
          format: body.format,
          duration: 0,
          tracks: [],
          scenes: [],
          settings: {
            fps: 30,
            resolution: {
              width: body.format === "16:9" ? 1920 : body.format === "9:16" ? 1080 : 1080,
              height: body.format === "16:9" ? 1080 : body.format === "9:16" ? 1920 : 1080,
            },
          },
        };

        const project = await fastify.prisma.project.create({
          data: {
            userId: request.userId!,
            name: body.name,
            description: body.description,
            format: body.format,
            timeline: defaultTimeline,
            settings: {
              autoSave: true,
              defaultFormat: body.format,
              defaultFPS: 30,
            },
          },
        });

        fastify.log.info("Project created successfully", { projectId: project.id });
        return project;
      } catch (error: any) {
        fastify.log.error("Error creating project:", {
          error: error.message,
          stack: error.stack,
          body: request.body,
          userId: request.userId,
        });
        return reply.code(500).send({
          error: error.message || "Failed to create project",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }
  );

  // Get all projects
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const projects = await fastify.prisma.project.findMany({
          where: { userId: request.userId! },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            format: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return { projects };
      } catch (error: any) {
        fastify.log.error("Error fetching projects:", error);
        return reply.code(500).send({
          error: error.message || "Failed to fetch projects",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }
  );

  // Get project by ID
  fastify.get(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };

        const project = await fastify.prisma.project.findFirst({
          where: {
            id,
            userId: request.userId!,
          },
        });

        if (!project) {
          return reply.code(404).send({ error: "Project not found" });
        }

        return project;
      } catch (error: any) {
        fastify.log.error("Error fetching project:", error);
        return reply.code(500).send({
          error: error.message || "Failed to fetch project",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }
  );

  // Update project
  fastify.patch(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateProjectSchema.parse(request.body);

      const project = await fastify.prisma.project.findFirst({
        where: {
          id,
          userId: request.userId!,
        },
      });

      if (!project) {
        return reply.code(404).send({ error: "Project not found" });
      }

      const updated = await fastify.prisma.project.update({
        where: { id },
        data: body,
      });

      return updated;
    }
  );

  // Delete project
  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const project = await fastify.prisma.project.findFirst({
        where: {
          id,
          userId: request.userId!,
        },
      });

      if (!project) {
        return reply.code(404).send({ error: "Project not found" });
      }

      await fastify.prisma.project.delete({
        where: { id },
      });

      return { success: true };
    }
  );
}

