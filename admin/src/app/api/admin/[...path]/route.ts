import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  const url = `${API_URL}/api/admin/${path.join("/")}${req.nextUrl.search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  let body: string | undefined;

  if (req.method !== "GET" && req.method !== "DELETE") {
    headers["Content-Type"] = "application/json";
    body = await req.text();
  }

  const response = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;