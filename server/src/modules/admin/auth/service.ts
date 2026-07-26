import bcrypt from "bcrypt";
import { AdminRole } from "@prisma/client";
import { authRepository } from "./repository";
import { signAdminToken } from "../../../shared/utils/jwt";
import {
  UnauthorizedError,
  ForbiddenError,
} from "../../../shared/errors/AppError";
import { BCRYPT_ROUNDS } from "../../../shared/constants";
import { addDays } from "../../../shared/utils/date";

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    lastLoginAt: Date | null;
  };
}

export const authService = {
  login: async (input: LoginInput): Promise<LoginResult> => {
    const { email, password, ipAddress, userAgent } = input;

    // 1. Find admin by email
    const admin = await authRepository.findAdminByEmail(email);
    if (!admin) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // 2. Check if admin is active
    if (!admin.isActive) {
      throw new ForbiddenError("Your account has been deactivated");
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // 4. Generate JWT
    const token = signAdminToken({ adminId: admin.id, role: admin.role });

    // 5. Persist session — expires in 7 days
    const expiresAt = addDays(new Date(), 7);
    await authRepository.createSession({
      adminUserId: admin.id,
      token,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // 6. Update lastLoginAt (fire and forget — non-critical)
    authRepository.updateLastLogin(admin.id).catch(() => {});

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
      },
    };
  },

  logout: async (token: string): Promise<void> => {
    const session = await authRepository.findSessionByToken(token);
    if (!session) return; // Already gone — idempotent
    await authRepository.deleteSessionByToken(token);
  },

  me: async (
    adminId: string
  ): Promise<{
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    lastLoginAt: Date | null;
    avatarUrl: string | null;
  }> => {
    const admin = await authRepository.findAdminById(adminId);
    if (!admin) {
      throw new UnauthorizedError("Admin not found");
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLoginAt: admin.lastLoginAt,
      avatarUrl: admin.avatarUrl,
    };
  },

  // Utility used by seed only — not exposed via API
  hashPassword: async (plain: string): Promise<string> => {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  },
};