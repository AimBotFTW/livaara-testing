import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response: res, user: middlewareUser } = await updateSession(request);

  // Enforce admin allowlist by email (comma-separated).
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/admin/login";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin && !isLogin) {
    const allowlist = (process.env.ADMIN_EMAIL ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (allowlist.length > 0) {
      const email = (middlewareUser?.email ?? "").trim().toLowerCase();
      if (!email || !allowlist.includes(email)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/login";
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
