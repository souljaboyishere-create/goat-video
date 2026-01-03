import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);

    // Check if user exists
    const existingUser = await fastify.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return reply.code(400).send({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user
    const user = await fastify.prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = fastify.jwt.sign({ userId: user.id });

    return { user, token };
  });

  // Login
  fastify.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);

    // Find user
    const user = await fastify.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    // Verify password
    const valid = await bcrypt.compare(body.password, user.password);

    if (!valid) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = fastify.jwt.sign({ userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    };
  });

  // Get current user
  fastify.get("/me", { preHandler: [fastify.authenticate] }, async (request) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.userId! },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return { user };
  });

  // Google OAuth (Not implemented yet)
  fastify.get("/google", async (request, reply) => {
    return reply.code(501).send({ 
      error: "Google OAuth is not implemented yet",
      message: "Please use email and password authentication" 
    });
  });
}

// Add authenticate decorator
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

// Register authenticate hook
export async function setupAuth(fastify: FastifyInstance) {
  fastify.decorate("authenticate", async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
      request.userId = (request.user as any).userId;
    } catch (err: any) {
      fastify.log.error({
        err,
        url: request.url,
        method: request.method,
        headers: request.headers.authorization ? "Authorization header present" : "No authorization header",
      }, "Authentication failed");
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });
}

