import { FastifyInstance } from "fastify";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { setupAuth } from "./auth.js";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env.S3_BUCKET || "video-ai-platform";

export default async function mediaRoutes(fastify: FastifyInstance) {
  // Setup auth
  await setupAuth(fastify);

  // Proxy video file through API (for MinIO CORS issues)
  fastify.get(
    "/proxy/*",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const pathParam = (request.params as any)["*"];
        if (!pathParam) {
          return reply.code(400).send({ error: "Missing path parameter" });
        }
        const path = decodeURIComponent(pathParam);
        
        // Parse S3 path
        let s3Key = path;
        if (path.startsWith("s3://")) {
          const match = path.match(/^s3:\/\/[^/]+\/(.+)$/);
          if (match) {
            s3Key = match[1];
          } else {
            return reply.code(400).send({ error: "Invalid S3 path format" });
          }
        }

        // Security check
        const userId = request.userId!;
        if (!s3Key.includes(`users/${userId}/`)) {
          return reply.code(403).send({ error: "Access denied" });
        }

        // Get object from S3
        const command = new GetObjectCommand({
          Bucket: BUCKET,
          Key: s3Key,
        });

        const response = await s3Client.send(command);
        
        if (!response.Body) {
          return reply.code(404).send({ error: "File not found" });
        }

        // Set appropriate headers
        reply.header("Content-Type", response.ContentType || "video/mp4");
        reply.header("Content-Length", response.ContentLength?.toString() || "");
        reply.header("Cache-Control", "public, max-age=3600");
        reply.header("Access-Control-Allow-Origin", "*");
        
        // Stream the file
        const stream = Readable.fromWeb(response.Body as any);
        return reply.send(stream);
      } catch (error: any) {
        fastify.log.error("Error proxying video:", error);
        return reply.code(500).send({
          error: "Failed to load video",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    }
  );

  // Get presigned URL for a file (fallback for production AWS S3)
  // Expects s3Path like: s3://video-ai-platform/users/{userId}/projects/{projectId}/source/{videoId}.mp4
  fastify.get(
    "/url",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { path } = request.query as { path: string };

        if (!path) {
          return reply.code(400).send({ error: "Missing 'path' query parameter" });
        }

        // Parse S3 path
        let s3Key = path;
        if (path.startsWith("s3://")) {
          const match = path.match(/^s3:\/\/[^/]+\/(.+)$/);
          if (match) {
            s3Key = match[1];
          } else {
            return reply.code(400).send({ error: "Invalid S3 path format" });
          }
        }

        // Security check
        const userId = request.userId!;
        if (!s3Key.includes(`users/${userId}/`)) {
          return reply.code(403).send({ error: "Access denied" });
        }

        // For MinIO, use proxy endpoint instead of presigned URL
        if (process.env.S3_ENDPOINT) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
          return { 
            url: `${apiUrl}/api/media/proxy/${encodeURIComponent(path)}`
          };
        }

        // For AWS S3, generate presigned URL
        const command = new GetObjectCommand({
          Bucket: BUCKET,
          Key: s3Key,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return { url: presignedUrl };
      } catch (error: any) {
        fastify.log.error("Error generating presigned URL:", error);
        return reply.code(500).send({
          error: "Failed to generate media URL",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    }
  );
}

