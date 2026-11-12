import { redirect } from "next/navigation";
import { ShopProvider } from "@/components/ShopProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";

export const metadata = { title: "Sign in - MELI" };

type Props = { searchParams: Promise<{ mode?: string; next?: string; error?: string }> };

export default async function Page({ searchParams }: Props) {
  const { mode, next, error } = await searchParams;
  if (supabaseReady) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) redirect("/account");
  }
  return (
    <ShopProvider>
      <Header />
      <main className="auth">
        <AuthForm
          initialMode={mode === "signup" ? "signup" : "login"}
          next={next ?? "/account"}
          linkError={error === "link"}
          ready={supabaseReady}
        />
      </main>
      <Footer />
    </ShopProvider>
  );
}
