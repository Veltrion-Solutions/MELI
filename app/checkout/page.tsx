import { redirect } from "next/navigation";
import Shop from "@/components/Shop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Checkout from "@/components/Checkout";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";

export const metadata = { title: "Checkout - MELI" };

export default async function Page() {
  let name = "";
  let email = "";
  if (supabaseReady) {
    // The bag belongs to a signed-in customer, so checkout does too.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?next=/checkout");
    name = (user.user_metadata?.full_name as string | undefined)?.trim() ?? "";
    email = user.email ?? "";
  }

  return (
    <Shop>
      <Header />
      <main className="section checkout">
        <Checkout defaultName={name} defaultEmail={email} />
      </main>
      <Footer />
    </Shop>
  );
}
