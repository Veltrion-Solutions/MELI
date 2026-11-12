// Creates (or repairs) the MELI admin account in the Supabase project from .env.
//
// Usage: add these to .env (single quotes keep $ and # characters literal):
//   SUPABASE_SECRET_KEY='sb_secret_...'      (Supabase > Project Settings > API Keys > Secret keys)
//   ADMIN_EMAIL='you@example.com'
//   ADMIN_PASSWORD='your password'
// then run:  npm run create-admin
// Afterwards remove ADMIN_PASSWORD from .env. The secret key must never go in NEXT_PUBLIC_* or in git.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!url || !publishable) fail("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing from .env.");
if (!secret) fail("SUPABASE_SECRET_KEY missing from .env (Project Settings > API Keys > Secret keys).");
if (!email || !password) fail("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.");
if (password !== password.trim()) fail("ADMIN_PASSWORD has spaces at the start or end. Remove them.");

console.log(`Project:  ${url}`);
console.log(`Admin:    ${email}`);
console.log(`Password: ${password.length} characters`);

const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

// 1. Find or create the user, confirmed, with this exact password.
async function findUser() {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail(`Couldn't list users: ${error.message}. Is SUPABASE_SECRET_KEY from this same project?`);
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

let user = await findUser();
if (user) {
  const { data, error } = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) fail(`Couldn't update the user: ${error.message}`);
  user = data.user;
  console.log("✓ Existing user found: password reset and email confirmed");
} else {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) fail(`Couldn't create the user: ${error.message}`);
  user = data.user;
  console.log("✓ User created and confirmed");
}

// 2. Grant admin access.
const { error: grantError } = await admin.from("admins").upsert({ user_id: user.id }, { onConflict: "user_id" });
if (grantError) fail(`Couldn't add to admins: ${grantError.message}. Has the migration been run?`);
console.log("✓ Added to public.admins");

// 3. Prove it: sign in the same way the website does.
const site = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
const { error: signInError } = await site.auth.signInWithPassword({ email, password });
if (signInError) fail(`Test sign-in failed: ${signInError.message}`);
const { data: isAdmin, error: rpcError } = await site.rpc("is_admin");
if (rpcError || isAdmin !== true) fail(`Signed in, but is_admin() returned ${rpcError?.message ?? isAdmin}.`);
await site.auth.signOut();

console.log("✓ Test sign-in worked and is_admin() = true");
console.log("\nDone. Sign in at /login with this email and password. Now delete ADMIN_PASSWORD from .env.\n");
