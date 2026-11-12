import { redirect } from "next/navigation";
import { ShopProvider } from "@/components/ShopProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordForm from "@/components/PasswordForm";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";

export const metadata = { title: "Set a new password - MELI" };

/** Reached from the account page, or from a password-reset email via /auth/confirm. */
export default async function Page() {
  if (!supabaseReady) redirect("/login");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=link");
  return (
    <ShopProvider>
      <Header />
      <main className="auth"><PasswordForm /></main>
      <Footer />
    </ShopProvider>
  );
}
