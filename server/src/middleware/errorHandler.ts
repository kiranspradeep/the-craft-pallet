import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";
import { sendError } from "../shared/helpers/response";
import { logger } from "../shared/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error("Non-operational error:", err);
    }
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Unhandled / unexpected errors
  logger.error("Unexpected error:", err);
  sendError(res, "Something went wrong", 500);
};