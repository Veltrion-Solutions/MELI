import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { ORDER_STEPS, STATUS_LABEL, formatOrderDate, itemCount, type Order, type OrderStep } from "@/lib/orders";

/** One order in a list: number, date, total, status and a mini progress bar. */
export default function OrderRow({ order: o, href = `/orders/${o.number}` }: { order: Order; href?: string }) {
  const cancelled = o.status === "cancelled";
  const step = cancelled ? -1 : ORDER_STEPS.indexOf(o.status as OrderStep);
  const count = itemCount(o);
  return (
    <li>
      <Link href={href} className="order-row">
        <div className="order-row-main">
          <p className="order-row-num">{o.number}</p>
          <p className="order-row-meta">{formatOrderDate(o.placed_at, false)} · {count} {count === 1 ? "item" : "items"} · {formatPrice(o.total)}</p>
        </div>
        <div className="order-row-status">
          <span className={`order-pill ${o.status}`}>{STATUS_LABEL[o.status]}</span>
          {!cancelled && (
            <span className="order-mini" aria-hidden>
              {ORDER_STEPS.map((s, i) => <span key={s} className={i <= step ? "on" : ""} />)}
            </span>
          )}
        </div>
        <span className="order-row-go">Track &rarr;</span>
      </Link>
    </li>
  );
}
