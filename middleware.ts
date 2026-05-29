import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const res = await updateSession(request);

  // Enforce admin allowlist by email (comma-separated).
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/admin/login";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin && !isLogin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const allowlist = (process.env.ADMIN_EMAIL ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (url && key && allowlist.length > 0) {
      const { createServerClient } = await import("@supabase/ssr");
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Middleware response cookies are already refreshed in updateSession.
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const email = (user?.email ?? "").trim().toLowerCase();
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
  matcher: ["/admin", "/admin/:path*"],
};
