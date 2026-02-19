import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server as IOServer } from "socket.io";
import indexRouter from "./routes/index";
import chatRouter from "./routes/chat";
import { setupSocket } from "./sockets/socketHandler";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
); // Enable CORS for all routes - adjust as needed for production
app.use("/", indexRouter);
app.use("/api/chat", chatRouter);

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chat_app";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Create Socket.IO server
const io = new IOServer(server, {
  // Configure CORS as needed for your frontend
  cors: {
    // origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// cors

// Setup our socket handlers
setupSocket(io);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
