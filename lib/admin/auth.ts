import { createClient } from "@/lib/supabase/server";

export async function requireAdminSession() {
  const supabase = await createClient();

  if (!supabase) {
    return { ok: false as const, error: "Supabase is not configured" };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false as const, error: "Unauthorized" };
  }

  // Enforce email allowlist — same check as middleware
  // This protects server actions from being called directly
  // by authenticated users who aren't in the admin allowlist
  const allowlist = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const email = (user.email ?? "").trim().toLowerCase();

  if (!email || allowlist.length === 0 || !allowlist.includes(email)) {
    return { ok: false as const, error: "Forbidden" };
  }

  return { ok: true as const, user };
}
