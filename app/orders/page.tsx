import Link from "next/link";
import { redirect } from "next/navigation";
import Shop from "@/components/Shop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderRow from "@/components/OrderRow";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
import { ORDER_COLUMNS, type Order } from "@/lib/orders";

export const metadata = { title: "My orders - MELI" };

export default async function Page() {
  if (!supabaseReady) redirect("/login");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/orders");

  const { data, error } = await supabase
    .from("orders").select(ORDER_COLUMNS).eq("user_id", user.id).order("placed_at", { ascending: false }).limit(100);
  const orders = (data ?? []) as unknown as Order[];

  return (
    <Shop>
      <Header />
      <main className="section checkout">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">My account</p>
            <h1>My orders</h1>
          </div>

          {error ? (
            <p className="auth-alert" role="alert">We couldn&rsquo;t load your orders. Please try again shortly.</p>
          ) : orders.length === 0 ? (
            <div className="co-empty">
              <p>You haven&rsquo;t placed any orders yet.</p>
              <Link href="/new" className="btn btn-solid">Shop new arrivals</Link>
            </div>
          ) : (
            <ul className="orders-list">
              {orders.map((o) => <OrderRow key={o.id} order={o} />)}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </Shop>
  );
}
