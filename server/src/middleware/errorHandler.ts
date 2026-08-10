import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";
import { sendError } from "../shared/helpers/response";
import { logger } from "../shared/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log every error with context
  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    name: err.name,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Unexpected errors — always return JSON
  sendError(res, "Something went wrong", 500);
};