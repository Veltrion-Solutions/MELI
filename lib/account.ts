import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { supabaseReady } from "./supabase/config";

/** Profile details kept in the customer's Supabase user metadata. */
export type Profile = {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postcode: string;
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function profileOf(user: User): Profile {
  const m = user.user_metadata ?? {};
  return {
    name: str(m.full_name),
    phone: str(m.phone),
    address: str(m.address),
    city: str(m.city),
    district: str(m.district),
    postcode: str(m.postcode),
  };
}

export const hasAddress = (p: Profile) => Boolean(p.address && p.city && p.district);

/**
 * The signed-in customer for an account page, or a redirect to /login (coming back to `here`).
 * getUser() verifies the session with Supabase, so it can't be spoofed with a cookie.
 */
export async function requireAccount(here: string) {
  if (!supabaseReady) redirect("/login");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(here)}`);
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return { supabase, user, isAdmin: isAdmin === true, profile: profileOf(user) };
}
