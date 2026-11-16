import { notFound, redirect } from "next/navigation";
import Shop from "@/components/Shop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderTracking from "@/components/OrderTracking";
import LiveRefresh from "@/components/LiveRefresh";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
import { ORDER_COLUMNS, ORDER_NUMBER_RE, type Order } from "@/lib/orders";

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ placed?: string }> };

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  return { title: `Order ${decodeURIComponent(number).toUpperCase()} - MELI`, robots: { index: false } };
}

export default async function Page({ params, searchParams }: Props) {
  const { number: raw } = await params;
  const { placed } = await searchParams;
  const number = decodeURIComponent(raw).toUpperCase();
  if (!supabaseReady) redirect("/login");
  if (!ORDER_NUMBER_RE.test(number)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${number}`)}`);

  // RLS only returns the customer's own orders (or any order, for admins).
  const { data } = await supabase.from("orders").select(ORDER_COLUMNS).eq("number", number).maybeSingle();
  if (!data) notFound();
  const order = data as unknown as Order;
  const finished = order.status === "delivered" || order.status === "cancelled";

  return (
    <Shop>
      <Header />
      <main className="section checkout">
        <OrderTracking order={order} justPlaced={placed === "1"} />
        {!finished && <LiveRefresh seconds={30} />}
      </main>
      <Footer />
    </Shop>
  );
}
