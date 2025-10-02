// /middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  // ✅ Publicly accessible routes (skip checks)
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/api/auth",
    "/_next",
    "/static",
    "/favicon.ico",
  ];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ✅ If no token → force login
  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ✅ Role-based route enforcement
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (
    (pathname.startsWith("/bookings") || pathname.startsWith("/profile")) &&
    token.role !== "customer"
  ) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ✅ Catch-all fallback: if role not matched, deny access
  if (!["admin", "customer"].includes(token.role)) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ Apply to ALL routes except clearly public ones
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|login|register).*)",
  ],
};
