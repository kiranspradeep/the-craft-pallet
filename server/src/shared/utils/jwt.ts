import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { AdminRole } from "@prisma/client";

export interface AdminTokenPayload extends JwtPayload {
  adminId: string;
  role: AdminRole;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return secret;
};

export const signAdminToken = (
  payload: { adminId: string; role: AdminRole },
  options?: SignOptions
): string => {
  return jwt.sign(payload, getSecret(), {
    expiresIn: "7d",
    ...options,
  });
};

export const verifyAdminToken = (token: string): AdminTokenPayload => {
  return jwt.verify(token, getSecret()) as AdminTokenPayload;
};