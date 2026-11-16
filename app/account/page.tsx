import Link from "next/link";
import AccountShell, { ACCOUNT_NAV, AccountIcon, type AccountSection } from "@/components/AccountShell";
import { hasAddress, requireAccount } from "@/lib/account";
import { formatPrice } from "@/lib/products";
import { ORDER_COLUMNS, ORDER_STEPS, STATUS_LABEL, formatOrderDate, itemCount, type Order, type OrderStep } from "@/lib/orders";

export const metadata = { title: "My account - MELI" };

const SAVED: Record<string, string> = {
  password: "Your password has been changed.",
  profile: "Your profile has been saved.",
  address: "Your delivery address has been saved.",
};

type Props = { searchParams: Promise<{ saved?: string }> };

export default async function Page({ searchParams }: Props) {
  const { supabase, user, isAdmin, profile } = await requireAccount("/account");
  const { saved } = await searchParams;

  const { data } = await supabase
    .from("orders").select(ORDER_COLUMNS).eq("user_id", user.id).order("placed_at", { ascending: false }).limit(200);
  const orders = (data ?? []) as unknown as Order[];
  const open = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const latest = open[0];
  const since = new Date(user.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const first = profile.name.split(/\s+/)[0];

  // What each section currently holds, shown on its tile.
  const status: Record<Exclude<AccountSection, "overview">, string> = {
    orders: orders.length === 0 ? "No orders yet" : `${orders.length} ${orders.length === 1 ? "order" : "orders"} · ${open.length} in progress`,
    profile: profile.name ? `${profile.name}${profile.phone ? ` · ${profile.phone}` : ""}` : "Add your name",
    address: hasAddress(profile) ? `${profile.city}, ${profile.district}` : "Not saved yet",
    password: `Signed in as ${user.email}`,
  };

  return (
    <AccountShell
      active="overview"
      title={`Hello${first ? `, ${first}` : ""}`}
      lead={`Member since ${since}. Here's everything you can do with your MELI account.`}
      name={profile.name}
      email={user.email}
      isAdmin={isAdmin}
    >
      {saved && SAVED[saved] && <p className="acc-saved" role="status">{SAVED[saved]}</p>}

      {/* ---------- Order in progress ---------- */}
      {latest ? (
        <section className="acc-active" aria-labelledby="acc-active-title">
          <div className="acc-active-top">
            <div>
              <p className="acc-label" id="acc-active-title">Order in progress</p>
              <p className="acc-active-num">{latest.number}</p>
              <p className="acc-muted">
                Placed {formatOrderDate(latest.placed_at, false)} · {itemCount(latest)} {itemCount(latest) === 1 ? "item" : "items"} · {formatPrice(latest.total)}
              </p>
            </div>
            <Link href={`/orders/${latest.number}`} className="btn btn-solid">Track order</Link>
          </div>
          <ol className="acc-progress" aria-label={`Status: ${STATUS_LABEL[latest.status]}`}>
            {ORDER_STEPS.map((s, i) => {
              const cur = ORDER_STEPS.indexOf(latest.status as OrderStep);
              return <li key={s} className={i < cur ? "done" : i === cur ? "current" : ""}><span aria-hidden />{STATUS_LABEL[s]}</li>;
            })}
          </ol>
          {open.length > 1 && <Link href="/account/orders" className="auth-link">+ {open.length - 1} more in progress</Link>}
        </section>
      ) : (
        <section className="acc-active acc-active-empty">
          <div>
            <p className="acc-label">Orders</p>
            <p className="acc-muted">
              {orders.length === 0 ? "You haven't placed an order yet. When you do, you can follow it step by step here." : "No orders on the way right now."}
            </p>
          </div>
          <Link href="/new" className="btn btn-outline">Shop new arrivals</Link>
        </section>
      )}

      {/* ---------- What you can do ---------- */}
      <div className="acc-tiles">
        {ACCOUNT_NAV.filter((n) => n.id !== "overview").map((n) => (
          <Link key={n.id} href={n.href} className="acc-tile">
            <span className="acc-tile-icon"><AccountIcon id={n.id} /></span>
            <span className="acc-tile-text">
              <span className="acc-tile-title">{n.label}</span>
              <span className="acc-tile-hint">{n.hint}</span>
              <span className="acc-tile-status">{status[n.id as Exclude<AccountSection, "overview">]}</span>
            </span>
            <span className="acc-tile-go" aria-hidden>&rarr;</span>
          </Link>
        ))}
      </div>

      {isAdmin && (
        <p className="account-admin">
          You have admin access. <Link href="/admin" className="auth-link">Open the admin dashboard &rarr;</Link>
        </p>
      )}
    </AccountShell>
  );
}
