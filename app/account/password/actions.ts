"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { passwordProblem } from "@/lib/password";

export type PwState = { error?: string } | undefined;

export async function updatePassword(_: PwState, form: FormData): Promise<PwState> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has ended. Please request a new reset link." };

  const problem = passwordProblem(password, user.email);
  if (problem) return { error: problem };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password you haven't used here before." };
    if (error.code === "weak_password") return { error: "Supabase rejected that password as too weak. Please choose a stronger one." };
    return { error: "We couldn't update your password. Your link may have expired — please request a new one." };
  }
  redirect("/account");
}
