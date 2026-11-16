import Link from "next/link";
import { redirect } from "next/navigation";
import AdminBar from "@/components/admin/AdminBar";
import { getAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/products";
import { ORDER_COLUMNS, ORDER_STATUSES, PAYMENT_LABEL, STATUS_LABEL, formatOrderDate, itemCount, type Order, type OrderStatus } from "@/lib/orders";

export const metadata = { title: "Orders - MELI Admin" };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function Page({ searchParams }: Props) {
  const admin = await getAdmin();
  if (!admin) redirect("/login?next=/admin/orders");
  const { status } = await searchParams;
  const filter = (ORDER_STATUSES as string[]).includes(status ?? "") ? (status as OrderStatus) : null;

  let query = admin.supabase.from("orders").select(ORDER_COLUMNS).order("placed_at", { ascending: false }).limit(200);
  if (filter) query = query.eq("status", filter);
  const { data, error } = await query;
  const rows = (data ?? []) as unknown as Order[];

  return (
    <>
      <AdminBar email={admin.user.email} />
      <main className="admin-main">
        <div className="admin-head">
          <div>
            <h1>Orders</h1>
            <p className="admin-sub">{rows.length} {filter ? STATUS_LABEL[filter].toLowerCase() : ""} order{rows.length === 1 ? "" : "s"}{rows.length === 200 ? " (latest 200)" : ""}</p>
          </div>
        </div>

        <nav className="admin-filters" aria-label="Filter by status">
          <Link href="/admin/orders" aria-current={!filter ? "page" : undefined}>All</Link>
          {ORDER_STATUSES.map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}`} aria-current={filter === s ? "page" : undefined}>{STATUS_LABEL[s]}</Link>
          ))}
        </nav>

        {error && <p className="auth-alert" role="alert">Couldn&rsquo;t load orders. Has the orders migration been run?</p>}

        {!error && rows.length === 0 ? (
          <p className="admin-sub">No orders here yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Items</th>
                  <th scope="col">Total</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Manage</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <th scope="row">
                      <p className="admin-name">{o.number}</p>
                      <p className="admin-badge">{formatOrderDate(o.placed_at)}</p>
                    </th>
                    <td data-label="Customer">{o.name}<p className="admin-badge">{o.city}, {o.district}</p></td>
                    <td data-label="Items">{itemCount(o)}</td>
                    <td data-label="Total">{formatPrice(o.total)}</td>
                    <td data-label="Payment">{PAYMENT_LABEL[o.payment]}</td>
                    <td data-label="Status"><span className={`order-pill ${o.status}`}>{STATUS_LABEL[o.status]}</span></td>
                    <td className="admin-edit-cell"><Link href={`/admin/orders/${o.number}`} className="admin-text-btn">Manage</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
