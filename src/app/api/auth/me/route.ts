import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { buildAuthProxyHeaders } from "@/lib/server/authProxyHeaders";
import { getAuthServiceUrl } from "@/lib/server/authServiceUrl";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${getAuthServiceUrl()}/api/auth/me`, {
      method: "GET",
      headers: buildAuthProxyHeaders(request, {
        authorization: `Bearer ${token}`,
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Auth service unavailable" }, { status: 502 });
  }

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
