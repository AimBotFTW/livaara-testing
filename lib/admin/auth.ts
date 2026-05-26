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

  return { ok: true as const, user };
}
