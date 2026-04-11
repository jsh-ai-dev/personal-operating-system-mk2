import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/register") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }
    return NextResponse.next();
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
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
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
