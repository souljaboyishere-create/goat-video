import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import websocket from "@fastify/websocket";
import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { Queue } from "bullmq";

// Routes
import authRoutes, { setupAuth } from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import jobRoutes from "./routes/jobs.js";
import { setupWebSocket } from "./services/websocket.js";
import { createWorkerProcessor } from "./services/workerProcessor.js";

// Types
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    redis: Redis;
    jobQueue: Queue;
  }
  interface FastifyRequest {
    userId?: string;
  }
}

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null, // Required for BullMQ
});
const jobQueue = new Queue("video-ai-jobs", {
  connection: redis,
});

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(cors, {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Worker-API-Key"],
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
});

await fastify.register(websocket);

// Register services
fastify.decorate("prisma", prisma);
fastify.decorate("redis", redis);
fastify.decorate("jobQueue", jobQueue);

// Setup authentication
await setupAuth(fastify);

// Register routes
await fastify.register(authRoutes, { prefix: "/api/auth" });
await fastify.register(projectRoutes, { prefix: "/api/projects" });
await fastify.register(jobRoutes, { prefix: "/api/jobs" });
await fastify.register(
  (await import("./routes/voices.js")).default,
  { prefix: "/api/voices" }
);
await fastify.register(
  (await import("./routes/characters.js")).default,
  { prefix: "/api/characters" }
);
await fastify.register(
  (await import("./routes/media.js")).default,
  { prefix: "/api/media" }
);

// Setup WebSocket
setupWebSocket(fastify);

// Setup worker processor (dispatches jobs to workers)
const workerProcessor = createWorkerProcessor(fastify, redis);
fastify.log.info("Worker processor started");

// Root route
fastify.get("/", async () => {
  return {
    message: "AI Video Creation Platform API",
    version: "0.1.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      projects: "/api/projects",
      jobs: "/api/jobs",
      voices: "/api/voices",
      characters: "/api/characters",
      media: "/api/media",
    },
    docs: "See README.md for API documentation",
  };
});

// Health check
fastify.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Start server
const port = parseInt(process.env.API_PORT || "3001");
const host = process.env.API_HOST || "0.0.0.0";

try {
  await fastify.listen({ port, host });
  console.log(`🚀 Server listening on http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  await fastify.close();
  await prisma.$disconnect();
  await redis.quit();
  await jobQueue.close();
  await workerProcessor.close();
  process.exit(0);
});

