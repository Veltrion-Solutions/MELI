import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminBar from "@/components/admin/AdminBar";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import { getAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/products";
import { ORDER_COLUMNS, ORDER_NUMBER_RE, ORDER_STEPS, PAYMENT_LABEL, STATUS_LABEL, formatOrderDate, stepTime, type Order } from "@/lib/orders";

type Props = { params: Promise<{ number: string }> };

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  return { title: `${decodeURIComponent(number)} - MELI Admin` };
}

export default async function Page({ params }: Props) {
  const { number: raw } = await params;
  const number = decodeURIComponent(raw).toUpperCase();
  const admin = await getAdmin();
  if (!admin) redirect(`/login?next=${encodeURIComponent(`/admin/orders/${number}`)}`);
  if (!ORDER_NUMBER_RE.test(number)) notFound();

  const { data } = await admin.supabase.from("orders").select(ORDER_COLUMNS).eq("number", number).maybeSingle();
  if (!data) notFound();
  const o = data as unknown as Order;

  return (
    <>
      <AdminBar email={admin.user.email} />
      <main className="admin-main">
        <Link href="/admin/orders" className="admin-text-btn admin-back">&larr; All orders</Link>
        <div className="admin-head">
          <div>
            <h1>{o.number}</h1>
            <p className="admin-sub">Placed {formatOrderDate(o.placed_at)} · {formatPrice(o.total)} · {PAYMENT_LABEL[o.payment]}</p>
          </div>
          <Link href={`/orders/${o.number}`} target="_blank" className="admin-text-btn">Customer view ↗</Link>
        </div>

        <div className="admin-editor">
          <div className="admin-editor-main">
            <section className="admin-panel">
              <h2>Items</h2>
              <table className="admin-table admin-items">
                <thead><tr><th scope="col">Item</th><th scope="col">Size</th><th scope="col">Colour</th><th scope="col">Qty</th><th scope="col">Price</th></tr></thead>
                <tbody>
                  {o.items.map((it, i) => (
                    <tr key={i}>
                      <th scope="row">{it.name}</th>
                      <td data-label="Size">{it.size}</td>
                      <td data-label="Colour">{it.colour}</td>
                      <td data-label="Qty">{it.qty}</td>
                      <td data-label="Price">{formatPrice(it.price * it.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="admin-sub">Subtotal {formatPrice(o.subtotal)} · Shipping {o.shipping === 0 ? "free" : formatPrice(o.shipping)} · <strong>Total {formatPrice(o.total)}</strong></p>
            </section>

            <section className="admin-panel">
              <h2>Customer &amp; delivery</h2>
              <p className="admin-address">
                {o.name}<br />{o.phone} · {o.email}<br />{o.address}, {o.city}<br />{o.district}{o.postcode && ` ${o.postcode}`}
              </p>
              {o.notes && <p className="admin-hint">Delivery note: {o.notes}</p>}
            </section>

            <section className="admin-panel">
              <h2>Timeline</h2>
              <ol className="admin-timeline">
                {ORDER_STEPS.map((s) => {
                  const at = stepTime(o, s);
                  return <li key={s} className={at ? "on" : ""}><span>{STATUS_LABEL[s]}</span><span>{at ? formatOrderDate(at) : "—"}</span></li>;
                })}
                {o.cancelled_at && <li className="on cancelled"><span>Cancelled</span><span>{formatOrderDate(o.cancelled_at)}</span></li>}
              </ol>
            </section>
          </div>

          <div className="admin-editor-side">
            <OrderStatusForm
              number={o.number}
              status={o.status}
              courier={o.courier}
              trackingNumber={o.tracking_number}
              note={o.status_note}
            />
          </div>
        </div>
      </main>
    </>
  );
}
