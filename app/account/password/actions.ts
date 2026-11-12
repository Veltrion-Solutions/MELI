"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PwState = { error?: string } | undefined;

export async function updatePassword(_: PwState, form: FormData): Promise<PwState> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password you haven't used here before." };
    return { error: "We couldn't update your password. Your link may have expired — please request a new one." };
  }
  redirect("/account");
}
