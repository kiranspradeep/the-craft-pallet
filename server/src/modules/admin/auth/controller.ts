import { Request, Response } from "express";
import { authService } from "./service";
import { sendSuccess } from "../../../shared/helpers/response";
import { asyncHandler } from "../../../shared/utils/asyncHandler";

export const authController = {
  // POST /api/admin/auth/login
  login: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await authService.login({
      email,
      password,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    sendSuccess({
      res,
      message: "Login successful",
      data: result,
      statusCode: 200,
    });
  }),

  // POST /api/admin/auth/logout
  logout: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      await authService.logout(token);
    }

    sendSuccess({
      res,
      message: "Logged out successfully",
    });
  }),

  // GET /api/admin/auth/me
  me: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const admin = await authService.me(req.admin!.id);

    sendSuccess({
      res,
      data: admin,
    });
  }),
};