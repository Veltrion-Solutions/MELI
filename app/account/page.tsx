import Link from "next/link";
import { redirect } from "next/navigation";
import Shop from "@/components/Shop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
import { logout } from "@/app/login/actions";
import OrderRow from "@/components/OrderRow";
import { ORDER_COLUMNS, type Order } from "@/lib/orders";

export const metadata = { title: "My account - MELI" };

export default async function Page() {
  if (!supabaseReady) redirect("/login");
  const supabase = await createClient();
  // getUser() checks the session with Supabase, so it can't be spoofed with a cookie.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  const name = (user.user_metadata?.full_name as string | undefined)?.trim();
  const since = new Date(user.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const { data: recent } = await supabase
    .from("orders").select(ORDER_COLUMNS).eq("user_id", user.id).order("placed_at", { ascending: false }).limit(3);
  const orders = (recent ?? []) as unknown as Order[];

  return (
    <Shop>
      <Header />
      <main className="section account">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">My account</p>
            <h1>Hello{name ? `, ${name.split(" ")[0]}` : ""}</h1>
          </div>

          {isAdmin === true && (
            <p className="account-admin">
              You have admin access. <Link href="/admin" className="auth-link">Open the admin dashboard →</Link>
            </p>
          )}

          <div className="account-grid">
            <section className="account-card" aria-labelledby="acc-details">
              <h2 id="acc-details">Account details</h2>
              <dl>
                {name && <><dt>Name</dt><dd>{name}</dd></>}
                <dt>Email</dt><dd>{user.email}</dd>
                <dt>Member since</dt><dd>{since}</dd>
              </dl>
              <Link href="/account/password" className="auth-link">Change password</Link>
            </section>

            <section className="account-card" aria-labelledby="acc-orders">
              <h2 id="acc-orders">Orders</h2>
              {orders.length === 0 ? (
                <>
                  <p className="account-empty">You haven&rsquo;t placed any orders yet.</p>
                  <Link href="/new" className="btn btn-outline">Shop new arrivals</Link>
                </>
              ) : (
                <>
                  <ul className="orders-list compact">
                    {orders.map((o) => <OrderRow key={o.id} order={o} />)}
                  </ul>
                  <Link href="/orders" className="auth-link">View all orders &amp; track</Link>
                </>
              )}
            </section>
          </div>

          <form action={logout}>
            <button type="submit" className="auth-link account-logout">Sign out</button>
          </form>
        </div>
      </main>
      <Footer />
    </Shop>
  );
}
