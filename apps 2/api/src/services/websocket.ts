import { FastifyInstance } from "fastify";

export function setupWebSocket(fastify: FastifyInstance) {
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
    });
  });
}

