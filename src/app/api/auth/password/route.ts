import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { buildAuthProxyHeaders } from "@/lib/server/authProxyHeaders";
import { getAuthServiceUrl } from "@/lib/server/authServiceUrl";

const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${getAuthServiceUrl()}/api/auth/password`, {
      method: "POST",
      headers: buildAuthProxyHeaders(request, {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ message: "Auth service unavailable" }, { status: 502 });
  }

  const data = (await res.json().catch(() => ({}))) as {
    accessToken?: string;
    user?: { id: string; email: string };
  };

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  if (!data.accessToken || !data.user) {
    return NextResponse.json({ message: "Invalid auth service response" }, { status: 502 });
  }

  const out = NextResponse.json({ user: data.user }, { status: 200 });
  out.cookies.set(AUTH_COOKIE_NAME, data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  return out;
}
