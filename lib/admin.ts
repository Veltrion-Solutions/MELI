import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { supabaseReady } from "./supabase/config";

/**
 * Returns the signed-in admin, or null. getUser() verifies the session with Supabase,
 * and is_admin() checks public.admins; the database's RLS policies enforce the same rule.
 */
export async function getAdmin() {
  if (!supabaseReady) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return null;
  return { supabase, user };
}

/** Only allow redirects back into this site. */
export const safePath = (n: string | null | undefined, fallback = "/account") =>
  n && n.startsWith("/") && !n.startsWith("//") ? n : fallback;

/**
 * Where to send someone after they sign in on the shared /login page:
 * admins go to the admin area by default; non-admins never land in /admin.
 */
export async function pathAfterLogin(supabase: SupabaseClient, next: string | null | undefined) {
  const want = safePath(next);
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) console.warn(`[login] is_admin check failed: ${error.code} ${error.message}`);
  else console.info(`[login] Signed in; admin = ${isAdmin === true}`);
  if (want.startsWith("/admin")) return isAdmin === true ? want : "/account";
  if (want === "/account" && isAdmin === true) return "/admin";
  return want;
}
