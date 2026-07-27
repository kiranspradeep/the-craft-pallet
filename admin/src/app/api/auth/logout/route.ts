import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("tcp_admin_token")?.value;

  // Tell the backend to delete the session
  if (token) {
    await fetch(`${API_URL}/api/admin/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("tcp_admin_token");
  response.cookies.delete("tcp_admin_user");

  return response;
}