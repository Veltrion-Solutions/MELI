"use client";

import { useActionState, useState } from "react";
import { savePrice, type SaveState } from "@/app/admin/actions";

const clean = (v: string) => v.replace(/[,\s]/g, "");

/** Inline price editor for one product row. */
export default function PriceCell({ id, price, name }: { id: string; price: number; name: string }) {
  const [value, setValue] = useState(String(price));
  const [saved, setSaved] = useState(String(price));
  const [state, action, pending] = useActionState<SaveState, FormData>(async (prev, fd) => {
    const res = await savePrice(prev, fd);
    if (res?.ok) setSaved(clean(String(fd.get("price") ?? "")));
    return res;
  }, undefined);
  const dirty = clean(value) !== saved;

  return (
    <form action={action} className="price-cell">
      <input type="hidden" name="id" value={id} />
      <input
        name="price"
        inputMode="numeric"
        aria-label={`Price of ${name} in rupees`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={Boolean(state?.error) || undefined}
      />
      <button type="submit" className="admin-save" disabled={pending || !dirty}>{pending ? "…" : "Save"}</button>
      <span className="price-status" role="status">
        {state?.error ? <span className="admin-warn">{state.error}</span> : state?.ok && !dirty ? "Saved ✓" : ""}
      </span>
    </form>
  );
}
