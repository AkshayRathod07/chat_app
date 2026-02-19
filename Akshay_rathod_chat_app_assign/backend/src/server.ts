import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server as IOServer } from "socket.io";
import indexRouter from "./routes/index";
import chatRouter from "./routes/chat";
import { setupSocket } from "./sockets/socketHandler";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import expressWinston from "express-winston";
// import { logger, requestLogger } from "./logger";

import { errorHandler } from "./middlewares/errorHandler";
import logger, { requestLogger } from "./logger";

dotenv.config();

const app = express();

// Basic security headers
app.use(helmet());

// JSON body parser
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Request logging middleware
app.use(requestLogger);
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: false,
    colorize: false,
    meta: false,
  }),
);

// Routes
app.use("/", indexRouter);
app.use("/api/chat", chatRouter);

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chat_app";

mongoose
  .connect(MONGO_URI)
  .then(() => logger.info("MongoDB connected"))
  .catch((err) => logger.error("MongoDB connection error:", err));

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Create Socket.IO server
const io = new IOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

// Setup our socket handlers
setupSocket(io);

// Centralized error handler
app.use(errorHandler);

server.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});

export default app;
