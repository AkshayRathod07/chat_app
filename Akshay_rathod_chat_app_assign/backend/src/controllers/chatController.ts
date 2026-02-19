import User from "../models/User";
import { getOnlineUsersSnapshot } from "../sockets/socketHandler";
import { Request, Response } from "express";
import * as chatService from "../services/chatService";
// POST /api/chat/typing - Notify typing (for REST fallback)
export async function typing(req: Request, res: Response) {
  try {
    const me = (req as any).user;
    const { to } = req.body;
    if (!me) return res.status(401).json({ message: "Unauthorized" });
    if (!to) return res.status(400).json({ message: "Missing 'to' field" });
    // In a real app, you might notify via sockets or update DB
    // Here, just acknowledge for REST fallback
    return res.json({ typing: true, from: me.id, to });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to notify typing" });
  }
}

// POST /api/chat/stopTyping - Notify stop typing (for REST fallback)
export async function stopTyping(req: Request, res: Response) {
  try {
    const me = (req as any).user;
    const { to } = req.body;
    if (!me) return res.status(401).json({ message: "Unauthorized" });
    if (!to) return res.status(400).json({ message: "Missing 'to' field" });
    return res.json({ typing: false, from: me.id, to });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to notify stopTyping" });
  }
}
// POST /api/chat/join - Join a chat room (1-1 or group)
export async function joinRoom(req: Request, res: Response) {
  try {
    const me = (req as any).user;
    const { roomId } = req.body;
    if (!me) return res.status(401).json({ message: "Unauthorized" });
    if (!roomId) return res.status(400).json({ message: "Missing roomId" });
    // In a real app, you might track room membership in DB or memory
    // Here, just acknowledge join for frontend to handle via socket
    return res.json({ joined: true, roomId });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to join room" });
  }
}

// POST /api/chat/leave - Leave a chat room
export async function leaveRoom(req: Request, res: Response) {
  try {
    const me = (req as any).user;
    const { roomId } = req.body;
    if (!me) return res.status(401).json({ message: "Unauthorized" });
    if (!roomId) return res.status(400).json({ message: "Missing roomId" });
    // In a real app, you might update DB or memory
    return res.json({ left: true, roomId });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to leave room" });
  }
}

// GET /api/chat/status - Get online users (for status)

export async function getStatus(req: Request, res: Response) {
  try {
    // Returns array of online user IDs
    const online = getOnlineUsersSnapshot();
    return res.json({ online });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to get status" });
  }
}

// GET /api/chat/users - List all users except self
export async function listUsers(req: Request, res: Response) {
  try {
    const me = (req as any).user;
    if (!me) return res.status(401).json({ message: "Unauthorized" });
    // Exclude self from list
    const users = await User.find(
      { _id: { $ne: me.id } },
      { email: 1, createdAt: 1 },
    ).lean();
    return res.json({ users });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to fetch users" });
  }
}

// GET /api/chat/history?userId=<otherUser>&page=1&limit=50
export async function getHistory(req: Request, res: Response) {
  try {
    // `req.user` set by auth middleware
    const me = (req as any).user;
    if (!me) return res.status(401).json({ message: "Unauthorized" });

    const otherUser = req.query.userId as string;
    if (!otherUser) return res.status(400).json({ message: "Missing userId" });

    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = Math.min(
      200,
      parseInt((req.query.limit as string) || "50", 10),
    );

    const data = await chatService.getMessagesBetween(
      me.id,
      otherUser,
      page,
      limit,
    );
    return res.json(data);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to fetch chat history" });
  }
}

// Optional: POST /api/chat/send fallback for non-socket clients
export async function sendFallback(req: Request, res: Response) {
  try {
    const me = (req as any).user;
    if (!me) return res.status(401).json({ message: "Unauthorized" });

    const { to, text } = req.body;
    if (!to || !text)
      return res.status(400).json({ message: "Missing fields" });

    const saved = await chatService.saveMessage(me.id, to, text);
    return res.status(201).json({ message: saved });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Failed to send message" });
  }
}
