import { redirect } from "next/navigation";
import Shop from "@/components/Shop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Checkout, { type CheckoutDefaults } from "@/components/Checkout";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
import { profileOf } from "@/lib/account";
import { DISTRICTS } from "@/lib/products";

export const metadata = { title: "Checkout - MELI" };

export default async function Page() {
  let defaults: CheckoutDefaults = { name: "", email: "", phone: "", address: "", city: "", district: "", postcode: "" };
  if (supabaseReady) {
    // The bag belongs to a signed-in customer, so checkout does too.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?next=/checkout");
    // Pre-fill from the profile and saved delivery address (My account).
    const { name, phone, address, city, district, postcode } = profileOf(user);
    defaults = {
      name, email: user.email ?? "", phone, address, city, postcode,
      district: DISTRICTS.some((d) => d.name === district) ? district : "",
    };
  }

  return (
    <Shop>
      <Header />
      <main className="section checkout">
        <Checkout defaults={defaults} />
      </main>
      <Footer />
    </Shop>
  );
}
