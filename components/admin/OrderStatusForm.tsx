"use client";

import { useActionState, useState } from "react";
import { updateOrder, type OrderSaveState } from "@/app/admin/actions";
import { ORDER_STATUSES, ORDER_STEPS, STATUS_LABEL, type OrderStatus } from "@/lib/orders";

type Props = { number: string; status: OrderStatus; courier: string; trackingNumber: string; note: string };

/** Admin panel for moving an order along its steps. */
export default function OrderStatusForm({ number, status, courier, trackingNumber, note }: Props) {
  const [state, action, pending] = useActionState<OrderSaveState, FormData>(updateOrder, undefined);
  const [value, setValue] = useState<OrderStatus>(status);
  const idx = ORDER_STEPS.indexOf(status as (typeof ORDER_STEPS)[number]);
  const next = idx >= 0 && idx < ORDER_STEPS.length - 1 ? ORDER_STEPS[idx + 1] : null;

  return (
    <form action={action} className="admin-panel">
      <h2>Update status</h2>
      <input type="hidden" name="number" value={number} />

      {next && value === status && (
        <button type="button" className="btn btn-solid admin-next" onClick={() => setValue(next)}>
          Move to &ldquo;{STATUS_LABEL[next]}&rdquo;
        </button>
      )}

      <label className="admin-field">
        Status
        <select name="status" value={value} onChange={(e) => setValue(e.target.value as OrderStatus)}>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </label>
      <label className="admin-field">
        Courier
        <input name="courier" defaultValue={courier} maxLength={80} placeholder="e.g. Domex, Pronto" />
      </label>
      <label className="admin-field">
        Tracking number
        <input name="tracking_number" defaultValue={trackingNumber} maxLength={80} />
        <small>Shown to the customer once the order is shipped.</small>
      </label>
      <label className="admin-field">
        Note to customer
        <textarea name="status_note" defaultValue={note} maxLength={300} rows={3} placeholder="Optional, e.g. 'Out for delivery today'" />
      </label>

      <button type="submit" className="btn btn-solid" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
      {value !== status && <p className="admin-hint">Saving will move the order from &ldquo;{STATUS_LABEL[status]}&rdquo; to &ldquo;{STATUS_LABEL[value]}&rdquo;.</p>}
      {state?.ok && <p className="admin-ok" role="status">Saved. The customer&rsquo;s tracking page is updated.</p>}
      {state?.error && <p className="auth-alert" role="alert">{state.error}</p>}
    </form>
  );
}
