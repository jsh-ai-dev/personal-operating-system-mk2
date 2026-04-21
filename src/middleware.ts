import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

function getAuthServiceUrl(): string {
  const raw = process.env.AUTH_SERVICE_URL;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.replace(/\/$/, "");
  }
  return "http://127.0.0.1:3002";
}

async function isSessionValid(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${getAuthServiceUrl()}/api/auth/me`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function redirectWithCookieClear(url: URL): NextResponse {
  const res = NextResponse.redirect(url);
  res.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasSession = typeof token === "string" && token.length > 0;
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/register") {
    if (!hasSession) {
      return NextResponse.next();
    }
    const valid = await isSessionValid(token);
    if (valid) {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }
    return redirectWithCookieClear(new URL("/login", request.url));
  }

  if (
    pathname === "/calendar" ||
    pathname.startsWith("/calendar/") ||
    pathname === "/notes" ||
    pathname.startsWith("/notes/")
  ) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const valid = await isSessionValid(token);
    if (!valid) {
      return redirectWithCookieClear(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const valid = await isSessionValid(token);
    if (valid) {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }
    return redirectWithCookieClear(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/calendar",
    "/calendar/:path*",
    "/notes",
    "/notes/:path*",
  ],
};
