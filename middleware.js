// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  // ✅ Allow NextAuth routes, static assets, homepage
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // ✅ Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // ✅ Protect customer routes
  if (pathname.startsWith("/bookings") || pathname.startsWith("/profile")) {
    if (!token || token.role !== "customer") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/bookings/:path*", "/profile/:path*"],
};
