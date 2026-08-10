import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // Read the multipart form data from the incoming request
  const formData = await req.formData();

  // Forward to Express admin upload endpoint
  const response = await fetch(`${API_URL}/api/admin/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type — fetch sets it automatically with the boundary
    },
    body: formData,
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}