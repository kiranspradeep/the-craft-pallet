import { Request, Response, NextFunction } from "express";
import { verifyAdminToken } from "../../../shared/utils/jwt";
import { authRepository } from "./repository";
import { UnauthorizedError, ForbiddenError } from "../../../shared/errors/AppError";
import { AdminRole } from "@prisma/client";
import { asyncHandler } from "../../../shared/utils/asyncHandler";

// ── Authenticate ────────────────────────────────────────────────────────────
// Reads JWT from Authorization header, verifies it, checks session exists,
// checks admin is still active, then attaches admin to req.admin
export const authenticateAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    // 1. Verify JWT signature and expiry
    let payload;
    try {
      payload = verifyAdminToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }

    // 2. Check session still exists in DB (handles logout)
    const session = await authRepository.findSessionByToken(token);
    if (!session) {
      throw new UnauthorizedError("Session not found. Please log in again");
    }

    // 3. Check session has not expired
    if (session.expiresAt < new Date()) {
      await authRepository.deleteSessionByToken(token).catch(() => {});
      throw new UnauthorizedError("Session expired. Please log in again");
    }

    // 4. Load admin and verify still active
    const admin = await authRepository.findAdminById(payload.adminId);
    if (!admin) {
      throw new UnauthorizedError("Admin account not found");
    }
    if (!admin.isActive) {
      throw new ForbiddenError("Your account has been deactivated");
    }

    // 5. Attach to request
    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      sessionId: session.id,
    };

    next();
  }
);

// ── Require Role ─────────────────────────────────────────────────────────────
// Usage: requireRole("SUPERADMIN")
export const requireRole = (...roles: AdminRole[]) =>
  asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      if (!req.admin) {
        throw new UnauthorizedError("Not authenticated");
      }
      if (!roles.includes(req.admin.role)) {
        throw new ForbiddenError(
          "You do not have permission to perform this action"
        );
      }
      next();
    }
  );