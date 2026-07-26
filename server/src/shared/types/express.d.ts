import { AdminRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        name: string;
        email: string;
        role: AdminRole;
        sessionId: string;
      };
    }
  }
}

export {};