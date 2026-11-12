"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
import { pathAfterLogin } from "@/lib/admin";
import { passwordProblem } from "@/lib/password";

export type AuthState = { error?: string; message?: string; email?: string; name?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function siteUrl() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

const NOT_READY: AuthState = { error: "Customer accounts aren't connected yet. Add the Supabase keys to .env.local." };

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  if (!supabaseReady) return NOT_READY;
  const email = str(form, "email");
  const password = String(form.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Logged on the server only; never includes the password.
    console.warn(`[login] Sign-in failed for ${email}: ${error.code ?? "unknown"} (${error.status ?? "-"}) ${error.message}`);
    const msg = error.code === "email_not_confirmed"
      ? "Please confirm your email first. Check your inbox for the link we sent."
      : "That email and password don't match. Please try again.";
    return { error: msg, email };
  }
  const to = await pathAfterLogin(supabase, str(form, "next"));
  revalidatePath("/", "layout");
  redirect(to);
}

export async function signup(_: AuthState, form: FormData): Promise<AuthState> {
  if (!supabaseReady) return NOT_READY;
  const name = str(form, "name");
  const email = str(form, "email");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const back = { email, name };

  if (!name || name.length > 80) return { error: "Please enter your name.", ...back };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address.", ...back };
  // Same rules as the live checklist; checked again here so they can't be skipped.
  const problem = passwordProblem(password, email);
  if (problem) return { error: problem, ...back };
  if (password !== confirm) return { error: "The two passwords don't match.", ...back };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: `${await siteUrl()}/auth/confirm?next=/account` },
  });
  if (error) {
    console.warn(`[signup] Failed for ${email}: ${error.code ?? "unknown"} ${error.message}`);
    const msg =
      error.code === "weak_password" ? "Supabase rejected that password as too weak. Please choose a stronger one."
      : error.code === "user_already_exists" || error.code === "email_exists" ? "There's already an account with that email. Try signing in instead."
      : error.code === "over_email_send_rate_limit" ? "Too many sign-up emails were sent just now. Please try again in a few minutes."
      : "We couldn't create your account. Please try again.";
    return { error: msg, ...back };
  }

  // With email confirmation turned off in Supabase, signUp signs the customer in straight away.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/account");
  }
  return { message: `We've sent a confirmation link to ${email}. Open it to activate your account.`, email };
}

export async function forgotPassword(_: AuthState, form: FormData): Promise<AuthState> {
  if (!supabaseReady) return NOT_READY;
  const email = str(form, "email");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/confirm?next=/account/password`,
  });
  if (error) return { error: "We couldn't send the email right now. Please try again in a minute.", email };
  // Same message whether or not the account exists, so emails can't be probed.
  return { message: `If there's an account for ${email}, a reset link is on its way.`, email };
}

export async function logout() {
  if (supabaseReady) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
