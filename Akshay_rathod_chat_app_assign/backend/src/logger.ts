import winston from "winston";
import expressWinston from "express-winston";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
  ],
});

// A small express middleware wrapper to attach request id or other info later
export const requestLogger = (req: any, _res: any, next: any) => {
  // attach a simple request id for correlating logs if desired
  (req as any).requestId =
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  next();
};

export default logger;
