import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
export async function middleware(request: NextRequest) {
  const result = await updateSession(request);
  if (result instanceof NextResponse) return result;
  const { response: res, user: middlewareUser } = result;

  // Enforce admin allowlist by email (comma-separated).
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/admin/login";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin && !isLogin) {
    // Note: See lib/env.ts for centralized environment variable validation.
    // We use process.env.ADMIN_EMAIL directly here for Edge runtime compatibility.
    const allowlist = (process.env.ADMIN_EMAIL ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const email = (middlewareUser?.email ?? "").trim().toLowerCase();
    if (allowlist.length === 0) {
      console.error("[CRITICAL] ADMIN_EMAIL env var is not set — blocking all admin access");
    }
    if (!email || allowlist.length === 0 || !allowlist.includes(email)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
