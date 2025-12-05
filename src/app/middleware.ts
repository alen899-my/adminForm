import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Protect only /admin routes
  if (path.startsWith("/admin")) {
    // Not logged in → signin
    if (!token) {
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }

    // Logged in but not admin → no access page
    if (role !== "admin") {
      url.pathname = "/no-access"; // Create this page
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/admin/:path*"],
};
