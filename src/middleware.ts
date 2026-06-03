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

type SessionUser = {
  email?: string;
};

async function getSessionUser(token: string): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${getAuthServiceUrl()}/api/auth/me`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: SessionUser };
    return data.user ?? null;
  } catch {
    return null;
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
    const user = await getSessionUser(token);
    if (user) {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }
    return redirectWithCookieClear(new URL("/login", request.url));
  }

  if (
    pathname === "/calendar" ||
    pathname.startsWith("/calendar/") ||
    pathname === "/notes" ||
    pathname.startsWith("/notes/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/mk3" ||
    pathname.startsWith("/mk3/")
  ) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const user = await getSessionUser(token);
    if (!user) {
      return redirectWithCookieClear(new URL("/login", request.url));
    }
    if (
      (pathname === "/admin" || pathname.startsWith("/admin/")) &&
      user.email?.toLowerCase() !== "admin@gmail.com"
    ) {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const user = await getSessionUser(token);
    if (user) {
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
    "/admin",
    "/admin/:path*",
    "/mk3",
    "/mk3/:path*",
  ],
};
