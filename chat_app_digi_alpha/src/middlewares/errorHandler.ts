import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(`Error on ${req.method} ${req.url} - ${err.message || err}`);
  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;
  res.status(status).json({ message });
}
