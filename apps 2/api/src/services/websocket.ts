import { FastifyInstance } from "fastify";

// Store WebSocket connections for broadcasting
const wsConnections = new Set<any>();

export function setupWebSocket(fastify: FastifyInstance) {
  // Store connections on Fastify instance for access in routes
  (fastify as any).wsConnections = wsConnections;

  fastify.get("/ws", { websocket: true }, (connection, req) => {
    // Authenticate WebSocket connection
    const token = req.url?.split("token=")[1];

    if (!token) {
      connection.socket.close(1008, "Unauthorized");
      return;
    }

    try {
      const decoded = fastify.jwt.verify(token);
      (connection.socket as any).userId = (decoded as any).userId;
    } catch (err) {
      connection.socket.close(1008, "Invalid token");
      return;
    }

    // Add connection to set
    wsConnections.add(connection.socket);

    connection.socket.on("message", (message: Buffer) => {
      // Handle incoming messages if needed
      try {
        const data = JSON.parse(message.toString());
        console.log("WebSocket message:", data);
      } catch (err) {
        console.error("Invalid WebSocket message:", err);
      }
    });

    connection.socket.on("close", () => {
      console.log("WebSocket connection closed");
      wsConnections.delete(connection.socket);
    });
  });
}

