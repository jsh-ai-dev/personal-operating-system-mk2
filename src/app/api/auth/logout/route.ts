import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getBackendUrl } from "@/lib/server/backendUrl";

export async function POST() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    try {
      await fetch(`${getBackendUrl()}/api/auth/logout`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
    } catch {
      // 쿠키는 항상 삭제
    }
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
