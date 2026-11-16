import { redirect } from "next/navigation";
import AccountShell from "@/components/AccountShell";
import PasswordForm from "@/components/PasswordForm";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
import { profileOf } from "@/lib/account";

export const metadata = { title: "Password & security - MELI" };

/** Reached from the account menu, or from a password-reset email via /auth/confirm. */
export default async function Page() {
  if (!supabaseReady) redirect("/login");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=link");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  const profile = profileOf(user);

  return (
    <AccountShell
      active="password"
      title="Password & security"
      lead="Choose a strong password you don't use anywhere else."
      name={profile.name}
      email={user.email}
      isAdmin={isAdmin === true}
    >
      <div className="acc-card">
        <PasswordForm email={user.email} embedded />
      </div>
      <p className="acc-muted acc-note">Forgot your current password? You don&rsquo;t need it here — you&rsquo;re already signed in.</p>
    </AccountShell>
  );
}
