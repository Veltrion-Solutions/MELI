import Link from "next/link";
import Photo from "./Photo";
import { DISTRICTS, SHIPPING_RATES, formatPrice } from "@/lib/products";
import {
  BANK_DETAILS, ORDER_STEPS, PAYMENT_LABEL, STATUS_LABEL, STEP_TEXT, formatOrderDate, itemCount, stepTime, type Order, type OrderStep,
} from "@/lib/orders";

export default function OrderTracking({ order: o, justPlaced }: { order: Order; justPlaced: boolean }) {
  const cancelled = o.status === "cancelled";
  const current = cancelled ? -1 : ORDER_STEPS.indexOf(o.status as OrderStep);
  const district = DISTRICTS.find((d) => d.name === o.district);
  const eta = district ? SHIPPING_RATES[district.rate].time : "";
  const first = o.name.trim().split(/\s+/)[0];
  const awaitingTransfer = o.payment === "bank" && o.status === "placed";
  const count = itemCount(o);

  return (
    <div className="container track">
      {justPlaced ? (
        <div className="co-done-head">
          <span className="co-done-check" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </span>
          <p className="eyebrow">Order {o.number}</p>
          <h1>Thank you{first ? `, ${first}` : ""}!</h1>
          <p className="co-done-lead">Your order has been placed. You can follow every step right here.</p>
        </div>
      ) : (
        <div className="track-head">
          <Link href="/account/orders" className="co-back">&larr; My orders</Link>
          <div className="section-head">
            <p className="eyebrow">Track order</p>
            <h1>{o.number}</h1>
          </div>
          <p className="track-meta">Placed {formatOrderDate(o.placed_at)} · {count} {count === 1 ? "item" : "items"} · {formatPrice(o.total)}</p>
        </div>
      )}

      {/* ---------- Current status ---------- */}
      <section className={`track-now${cancelled ? " cancelled" : ""}`} aria-live="polite">
        <div>
          <p className="track-now-label">Current status</p>
          <p className="track-now-status">{STATUS_LABEL[o.status]}</p>
          <p className="track-now-text">
            {cancelled
              ? "This order was cancelled. If you've already paid, your refund is on its way."
              : STEP_TEXT[o.status as OrderStep]}
          </p>
          {o.status_note && <p className="track-note">{o.status_note}</p>}
        </div>
        {!cancelled && o.status !== "delivered" && eta && (
          <div className="track-eta">
            <p className="track-now-label">Delivery to {o.district}</p>
            <p>{eta} after dispatch</p>
          </div>
        )}
      </section>

      {/* ---------- Step-by-step timeline ---------- */}
      <ol className="track-steps" aria-label="Order progress">
        {ORDER_STEPS.map((s, i) => {
          const at = stepTime(o, s);
          const state = cancelled ? (at ? "done" : "off") : i < current || s === "delivered" && i === current ? "done" : i === current ? "current" : "todo";
          return (
            <li key={s} className={`track-step ${state}`} aria-current={i === current ? "step" : undefined}>
              <span className="track-dot" aria-hidden>{state === "done" ? "✓" : i + 1}</span>
              <div className="track-body">
                <p className="track-title">{STATUS_LABEL[s]}</p>
                <p className="track-text">{STEP_TEXT[s]}</p>
                {at && <p className="track-time">{formatOrderDate(at)}</p>}
                {s === "shipped" && at && (o.courier || o.tracking_number) && (
                  <p className="track-courier">
                    {o.courier && <>Courier: <strong>{o.courier}</strong></>}
                    {o.courier && o.tracking_number && " · "}
                    {o.tracking_number && <>Tracking no. <strong>{o.tracking_number}</strong></>}
                  </p>
                )}
              </div>
            </li>
          );
        })}
        {cancelled && (
          <li className="track-step current cancelled" aria-current="step">
            <span className="track-dot" aria-hidden>&times;</span>
            <div className="track-body">
              <p className="track-title">Cancelled</p>
              {o.cancelled_at && <p className="track-time">{formatOrderDate(o.cancelled_at)}</p>}
            </div>
          </li>
        )}
      </ol>

      {awaitingTransfer && (
        <div className="co-bank">
          <p className="co-ship-title">Complete your bank transfer</p>
          <dl>
            {BANK_DETAILS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            <div><dt>Amount</dt><dd>{formatPrice(o.total)}</dd></div>
            <div><dt>Reference</dt><dd>{o.number}</dd></div>
          </dl>
          <p>Please use your order number as the reference. We&rsquo;ll confirm your order once the payment clears.</p>
        </div>
      )}

      {/* ---------- Details ---------- */}
      <div className="co-done-grid">
        <section className="co-done-card" aria-labelledby="tr-d1">
          <h2 id="tr-d1">Delivery address</h2>
          <p>{o.name}<br />{o.address}, {o.city}<br />{o.district}{o.postcode && ` ${o.postcode}`}<br />{o.phone}</p>
          {o.notes && <p className="co-muted">Note: {o.notes}</p>}
        </section>
        <section className="co-done-card" aria-labelledby="tr-d2">
          <h2 id="tr-d2">Payment</h2>
          <p>{PAYMENT_LABEL[o.payment]}</p>
          <p className="co-muted">
            {o.payment === "cod"
              ? o.status === "delivered" ? "Paid on delivery." : `Please have ${formatPrice(o.total)} ready on delivery.`
              : awaitingTransfer ? "Awaiting your transfer." : "Payment received."}
          </p>
        </section>
        <section className="co-done-card co-done-items" aria-labelledby="tr-d3">
          <h2 id="tr-d3">Items</h2>
          <ul className="co-lines">
            {o.items.map((it, i) => (
              <li key={`${it.id}-${it.size}-${it.colour}-${i}`} className="co-line">
                <div className="co-thumb">
                  <Photo src={it.image ?? undefined} alt={it.name} sizes="64px" />
                  <span className="co-qty" aria-label={`Quantity ${it.qty}`}>{it.qty}</span>
                </div>
                <div>
                  <p className="co-line-name">{it.name}</p>
                  <p className="co-line-variant">{it.colour} · Size {it.size}</p>
                </div>
                <p className="co-line-price">{formatPrice(it.price * it.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="co-totals">
            <div><dt>Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd>{o.shipping === 0 ? "Free" : formatPrice(o.shipping)}</dd></div>
            <div className="co-total"><dt>Total</dt><dd>{formatPrice(o.total)}</dd></div>
          </dl>
        </section>
      </div>

      <p className="track-help">
        Questions about this order? Contact us with your order number, or see <Link href="/shipping-returns">shipping &amp; returns</Link>.
      </p>
      <div className="co-done-actions">
        {justPlaced && <Link href="/account/orders" className="btn btn-outline">View all orders</Link>}
        <Link href="/new" className="btn btn-solid">Continue shopping</Link>
      </div>
    </div>
  );
}
