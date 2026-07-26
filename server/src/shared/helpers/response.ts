import { Response } from "express";

interface SuccessPayload {
  res: Response;
  message?: string;
  data?: unknown;
  statusCode?: number;
  meta?: Record<string, unknown>;
}

export const sendSuccess = ({
  res,
  message = "Success",
  data,
  statusCode = 200,
  meta,
}: SuccessPayload): void => {
  const body: Record<string, unknown> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    body.data = data;
  }

  if (meta !== undefined) {
    body.meta = meta;
  }

  res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
): void => {
  const body: Record<string, unknown> = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    body.errors = errors;
  }

  res.status(statusCode).json(body);
};