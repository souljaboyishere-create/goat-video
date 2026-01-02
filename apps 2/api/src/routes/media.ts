import { FastifyInstance } from "fastify";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { setupAuth } from "./auth.js";

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

  // Get presigned URL for a file
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
        // Format: s3://bucket/key or just the key
        let s3Key = path;
        if (path.startsWith("s3://")) {
          // Extract key from s3://bucket/key format
          const match = path.match(/^s3:\/\/[^/]+\/(.+)$/);
          if (match) {
            s3Key = match[1];
          } else {
            return reply.code(400).send({ error: "Invalid S3 path format" });
          }
        }

        // Security check: ensure the user can only access their own files
        const userId = request.userId!;
        if (!s3Key.includes(`users/${userId}/`)) {
          return reply.code(403).send({ error: "Access denied" });
        }

        // Generate presigned URL (valid for 1 hour)
        const command = new GetObjectCommand({
          Bucket: BUCKET,
          Key: s3Key,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600, // 1 hour
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

