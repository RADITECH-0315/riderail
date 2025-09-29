// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = token?.role === "admin";
  const url = req.nextUrl.clone();

  // Allow /admin/login without forcing redirect
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!isAdmin) {
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
