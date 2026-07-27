"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TOKEN_KEY = "tcp_admin_token";
const ADMIN_KEY = "tcp_admin_user";

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_KEY)?.value ?? null;
}

export async function getAdmin(): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
} | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_KEY)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setSession(
  token: string,
  admin: { id: string; name: string; email: string; role: string }
): Promise<void> {
  const cookieStore = await cookies();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  cookieStore.set(TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  cookieStore.set(ADMIN_KEY, JSON.stringify(admin), {
    httpOnly: false, // readable by client for display
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_KEY);
  cookieStore.delete(ADMIN_KEY);
}

export async function requireAuth(): Promise<string> {
  const token = await getToken();
  if (!token) redirect("/login");
  return token;
}