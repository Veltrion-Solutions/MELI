"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
import { DISTRICTS } from "@/lib/products";
import { LIMITS, TOO_MANY, allowed } from "@/lib/rate-limit";

export type FormState = { error?: string; fields?: Record<string, string> } | undefined;

const PHONE_RE = /^(?:\+94|0)\d{9}$/;
const get = (form: FormData, k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);

async function signedIn() {
  if (!supabaseReady) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!(await allowed([`profile:user:${user.id}`, LIMITS.profileUser]))) return "limited" as const;
  return supabase;
}

export async function saveProfile(_: FormState, form: FormData): Promise<FormState> {
  const fields = { name: get(form, "name", 120), phone: get(form, "phone", 20) };
  if (fields.name.length < 2) return { error: "Please enter your full name.", fields };
  if (fields.phone && !PHONE_RE.test(fields.phone.replace(/[\s-]/g, ""))) {
    return { error: "Enter a Sri Lankan mobile number, e.g. 077 123 4567.", fields };
  }
  const supabase = await signedIn();
  if (supabase === "limited") return { error: TOO_MANY, fields };
  if (!supabase) return { error: "Your session has ended. Please sign in again.", fields };
  const { error } = await supabase.auth.updateUser({ data: { full_name: fields.name, phone: fields.phone } });
  if (error) return { error: "We couldn't save your profile. Please try again.", fields };
  revalidatePath("/account", "layout");
  redirect("/account?saved=profile");
}

export async function saveAddress(_: FormState, form: FormData): Promise<FormState> {
  const fields = {
    address: get(form, "address", 300),
    city: get(form, "city", 80),
    district: get(form, "district", 40),
    postcode: get(form, "postcode", 12),
  };
  if (fields.address.length < 5) return { error: "Please enter your street address.", fields };
  if (fields.city.length < 2) return { error: "Please enter your town or city.", fields };
  if (!DISTRICTS.some((d) => d.name === fields.district)) return { error: "Please choose your district.", fields };
  const supabase = await signedIn();
  if (supabase === "limited") return { error: TOO_MANY, fields };
  if (!supabase) return { error: "Your session has ended. Please sign in again.", fields };
  const { error } = await supabase.auth.updateUser({ data: fields });
  if (error) return { error: "We couldn't save your address. Please try again.", fields };
  revalidatePath("/account", "layout");
  redirect("/account?saved=address");
}

export async function removeAddress(): Promise<void> {
  const supabase = await signedIn();
  if (!supabase || supabase === "limited") redirect(supabase ? "/account/address" : "/login?next=/account/address");
  await supabase.auth.updateUser({ data: { address: "", city: "", district: "", postcode: "" } });
  revalidatePath("/account", "layout");
  redirect("/account/address");
}
