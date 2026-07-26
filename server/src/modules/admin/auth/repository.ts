import { prisma } from "../../../prisma/client";
import { AdminUser, AdminSession } from "@prisma/client";

export const authRepository = {
  // ── AdminUser ──────────────────────────────────────────────

  findAdminByEmail: async (email: string): Promise<AdminUser | null> => {
    return prisma.adminUser.findUnique({
      where: { email },
    });
  },

  findAdminById: async (id: string): Promise<AdminUser | null> => {
    return prisma.adminUser.findUnique({
      where: { id },
    });
  },

  updateLastLogin: async (id: string): Promise<void> => {
    await prisma.adminUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },

  // ── AdminSession ───────────────────────────────────────────

  createSession: async (data: {
    adminUserId: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<AdminSession> => {
    return prisma.adminSession.create({ data });
  },

  findSessionByToken: async (token: string): Promise<AdminSession | null> => {
    return prisma.adminSession.findUnique({
      where: { token },
    });
  },

  deleteSessionByToken: async (token: string): Promise<void> => {
    await prisma.adminSession.delete({
      where: { token },
    });
  },

  deleteAllSessionsForAdmin: async (adminUserId: string): Promise<void> => {
    await prisma.adminSession.deleteMany({
      where: { adminUserId },
    });
  },
};