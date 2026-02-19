import { Server as IOServer, Socket } from "socket.io";
import * as chatService from "../services/chatService";
import { verifyToken } from "../services/authService";

// Track connected sockets per user to support multiple tabs
const onlineUsers: Map<string, Set<string>> = new Map();

// Helper: add socket id to user's set, return true if this is first connection
function addConnection(userId: string, socketId: string) {
  const set = onlineUsers.get(userId) || new Set<string>();
  set.add(socketId);
  onlineUsers.set(userId, set);
  return set.size === 1;
}

// Helper: remove socket id, return true if user is now offline
function removeConnection(userId: string, socketId: string) {
  const set = onlineUsers.get(userId);
  if (!set) return true;
  set.delete(socketId);
  if (set.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }
  onlineUsers.set(userId, set);
  return false;
}

// Expose read-only presence snapshot (useful for admin endpoints)
export function getOnlineUsersSnapshot() {
  return Array.from(onlineUsers.keys());
}

// Main setup function - call from server startup with the io instance
export function setupSocket(io: IOServer) {
  // Socket auth middleware: expect token in handshake.auth.token
  io.use((socket: Socket, next) => {
    try {
      const token =
        (socket.handshake.auth && (socket.handshake.auth as any).token) ||
        socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("Unauthorized"));
      const decoded = verifyToken(token) as any;
      // Store minimal user info on socket object
      (socket as any).user = { id: decoded.id, email: decoded.email };
      return next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    if (!user || !user.id) {
      socket.disconnect(true);
      return;
    }

    const userId: string = user.id;

    // Each user joins a personal room named by userId to receive direct messages
    socket.join(userId);

    // Update presence; if this is first connection for user, broadcast `userOnline`
    const becameOnline = addConnection(userId, socket.id);
    if (becameOnline) {
      // Broadcast to everyone — in real app, you might notify only contacts
      io.emit("userOnline", { userId });
    }

    // Handle sendMessage event from clients
    // payload: { to: string (userId), text: string }
    socket.on("sendMessage", async (payload: any, ack: (arg: any) => void) => {
      try {
        if (!payload || !payload.to || !payload.text) {
          return ack({ ok: false, message: "Invalid payload" });
        }

        const saved = await chatService.saveMessage(
          userId,
          payload.to,
          payload.text,
        );

        // Emit to receiver's personal room. If receiver has multiple tabs, all will get it.
        io.to(payload.to).emit("receiveMessage", {
          id: saved._id,
          senderId: saved.senderId,
          receiverId: saved.receiverId,
          text: saved.text,
          createdAt: saved.createdAt,
        });

        // Acknowledge sender with saved message
        ack({ ok: true, message: saved });
      } catch (err: any) {
        ack({ ok: false, message: err.message || "Failed to send" });
      }
    });

    // Typing indicator: forward to receiver only
    socket.on("typing", (payload: any) => {
      // payload: { to }
      if (!payload || !payload.to) return;
      io.to(payload.to).emit("typing", { from: userId });
    });

    socket.on("stopTyping", (payload: any) => {
      if (!payload || !payload.to) return;
      io.to(payload.to).emit("stopTyping", { from: userId });
    });

    socket.on("disconnect", () => {
      const wentOffline = removeConnection(userId, socket.id);
      if (wentOffline) {
        io.emit("userOffline", { userId });
      }
    });
  });
}
