import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

interface WSMessage {
  type: string;
  payload: any;
}

class WebSocketHub {
  private wss: WebSocketServer | null = null;
  private userSockets: Map<string, Set<AuthenticatedSocket>> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws: AuthenticatedSocket, req: IncomingMessage) => {
      ws.isAlive = true;

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("message", (data) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      });

      ws.on("close", () => {
        this.removeSocket(ws);
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.removeSocket(ws);
      });
    });

    const interval = setInterval(() => {
      this.wss?.clients.forEach((ws) => {
        const socket = ws as AuthenticatedSocket;
        if (!socket.isAlive) {
          this.removeSocket(socket);
          return socket.terminate();
        }
        socket.isAlive = false;
        socket.ping();
      });
    }, 30000);

    this.wss.on("close", () => {
      clearInterval(interval);
    });
  }

  private handleMessage(ws: AuthenticatedSocket, message: WSMessage) {
    switch (message.type) {
      case "authenticate":
        ws.userId = message.payload.userId;
        this.addSocket(ws);
        ws.send(JSON.stringify({ type: "authenticated", payload: { success: true } }));
        break;

      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;

      default:
        break;
    }
  }

  private addSocket(ws: AuthenticatedSocket) {
    if (!ws.userId) return;

    if (!this.userSockets.has(ws.userId)) {
      this.userSockets.set(ws.userId, new Set());
    }
    this.userSockets.get(ws.userId)!.add(ws);
  }

  private removeSocket(ws: AuthenticatedSocket) {
    if (!ws.userId) return;

    const sockets = this.userSockets.get(ws.userId);
    if (sockets) {
      sockets.delete(ws);
      if (sockets.size === 0) {
        this.userSockets.delete(ws.userId);
      }
    }
  }

  sendToUser(userId: string, message: WSMessage) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      const data = JSON.stringify(message);
      sockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(data);
        }
      });
    }
  }

  broadcast(message: WSMessage) {
    if (!this.wss) return;

    const data = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  broadcastToAuthenticated(message: WSMessage) {
    const data = JSON.stringify(message);
    this.userSockets.forEach((sockets) => {
      sockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(data);
        }
      });
    });
  }

  sendNotification(userId: string, notification: any) {
    this.sendToUser(userId, {
      type: "notification",
      payload: notification,
    });
  }

  sendChatMessage(userId: string, chatId: string, message: any) {
    this.sendToUser(userId, {
      type: "chat_message",
      payload: { chatId, message },
    });
  }

  broadcastCommunityPost(post: any) {
    this.broadcast({
      type: "community_post",
      payload: post,
    });
  }

  broadcastPostUpdate(postId: string, update: any) {
    this.broadcast({
      type: "post_update",
      payload: { postId, ...update },
    });
  }
}

export const wsHub = new WebSocketHub();
