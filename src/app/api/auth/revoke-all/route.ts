import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getAuthServiceUrl } from "@/lib/server/authServiceUrl";

/** Nest `POST /api/auth/sessions/revoke-all` — 모든 기기 세션 무효화 */
export async function POST() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${getAuthServiceUrl()}/api/auth/sessions/revoke-all`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
  } catch {
    return NextResponse.json({ message: "API 서버에 연결할 수 없습니다." }, { status: 502 });
  }

  if (!backendRes.ok) {
    const text = await backendRes.text();
    return new NextResponse(text || null, {
      status: backendRes.status,
      headers: { "content-type": backendRes.headers.get("content-type") ?? "application/json" },
    });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
