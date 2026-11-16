import Link from "next/link";
import AccountShell from "@/components/AccountShell";
import OrderRow from "@/components/OrderRow";
import { requireAccount } from "@/lib/account";
import { ORDER_COLUMNS, type Order } from "@/lib/orders";

export const metadata = { title: "My orders - MELI" };

export default async function Page() {
  const { supabase, user, isAdmin, profile } = await requireAccount("/account/orders");
  const { data, error } = await supabase
    .from("orders").select(ORDER_COLUMNS).eq("user_id", user.id).order("placed_at", { ascending: false }).limit(100);
  const orders = (data ?? []) as unknown as Order[];
  const open = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const past = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");

  return (
    <AccountShell
      active="orders"
      title="My orders"
      lead="Choose an order to see its delivery details and follow it step by step."
      name={profile.name}
      email={user.email}
      isAdmin={isAdmin}
    >
      {error ? (
        <p className="auth-alert" role="alert">We couldn&rsquo;t load your orders. Please try again shortly.</p>
      ) : orders.length === 0 ? (
        <div className="acc-active acc-active-empty">
          <p className="acc-muted">You haven&rsquo;t placed any orders yet.</p>
          <Link href="/new" className="btn btn-solid">Shop new arrivals</Link>
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <section className="acc-block" aria-labelledby="ord-open">
              <h2 id="ord-open" className="acc-label">In progress ({open.length})</h2>
              <ul className="orders-list">{open.map((o) => <OrderRow key={o.id} order={o} />)}</ul>
            </section>
          )}
          {past.length > 0 && (
            <section className="acc-block" aria-labelledby="ord-past">
              <h2 id="ord-past" className="acc-label">Completed ({past.length})</h2>
              <ul className="orders-list">{past.map((o) => <OrderRow key={o.id} order={o} />)}</ul>
            </section>
          )}
        </>
      )}
    </AccountShell>
  );
}
