import { Router } from "express";
import * as chatController from "../controllers/chatController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Typing indicator (REST fallback)
router.post("/typing", protect, chatController.typing);
router.post("/stopTyping", protect, chatController.stopTyping);
// Join a chat room
router.post("/join", protect, chatController.joinRoom);

// Leave a chat room
router.post("/leave", protect, chatController.leaveRoom);

// Get online user status
router.get("/status", protect, chatController.getStatus);

// List all users except self
router.get("/users", protect, chatController.listUsers);

// Fetch chat history between authenticated user and query.userId
router.get("/history", protect, chatController.getHistory);

// REST fallback to send message (already present)
router.post("/send", protect, chatController.sendFallback);

// Fetch messages (receive) is covered by /history endpoint

export default router;
