import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || "Login failed" },
      { status: res.status }
    );
  }

  const { token, admin } = data.data;

  const response = NextResponse.json({ success: true, admin });

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  response.cookies.set("tcp_admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  response.cookies.set("tcp_admin_user", JSON.stringify(admin), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  return response;
}