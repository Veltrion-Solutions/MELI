"use client";

import { useActionState } from "react";
import Photo from "@/components/Photo";
import { saveProduct, type SaveState } from "@/app/admin/actions";
import { SIZES } from "@/lib/products";
import type { ProductRow } from "@/lib/catalog";

export default function ProductEditor({ product: p }: { product: ProductRow }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveProduct, undefined);

  return (
    <form action={action} className="admin-editor">
      <input type="hidden" name="id" value={p.id} />

      <div className="admin-editor-main">
        <section className="admin-panel">
          <h2>Basics</h2>
          <label className="admin-field"><span>Name</span><input name="name" defaultValue={p.name} required maxLength={120} /></label>
          <div className="admin-row">
            <label className="admin-field"><span>Price (Rs)</span><input name="price" inputMode="numeric" defaultValue={p.price} required /></label>
            <label className="admin-field"><span>Category</span>
              <select name="category" defaultValue={p.category}><option value="dresses">Dresses</option><option value="tops">Tops</option></select>
            </label>
            <label className="admin-field"><span>Badge</span>
              <select name="badge" defaultValue={p.badge ?? ""}><option value="">None</option><option value="New">New</option><option value="Best seller">Best seller</option></select>
            </label>
          </div>
          <label className="admin-field"><span>Description</span><textarea name="description" rows={3} defaultValue={p.description} /></label>
          <label className="admin-field"><span>Details &amp; care <small>One per line</small></span><textarea name="details" rows={4} defaultValue={p.details.join("\n")} /></label>
        </section>

        <section className="admin-panel">
          <h2>Colours &amp; sizes</h2>
          <label className="admin-field">
            <span>Colours <small>One per line: name then hex code, e.g. Butter #f1e7b4. The first is the colour in the photos.</small></span>
            <textarea name="colours" rows={3} defaultValue={p.colours.map((c) => `${c.name} ${c.hex}`).join("\n")} />
          </label>
          <fieldset className="admin-field">
            <legend>Sizes in stock</legend>
            <div className="admin-sizes">
              {SIZES.map((s) => (
                <label key={s} className="admin-size"><input type="checkbox" name="in_stock" value={s} defaultChecked={p.in_stock.includes(s)} /><span>{s}</span></label>
              ))}
            </div>
          </fieldset>
        </section>
      </div>

      <aside className="admin-editor-side">
        <section className="admin-panel">
          <h2>Visibility</h2>
          <label className="admin-toggle"><input type="checkbox" name="active" defaultChecked={p.active} /><span>Show in shop</span></label>
          <label className="admin-field"><span>Sort order <small>Lower shows first</small></span><input name="sort" type="number" step={1} defaultValue={p.sort} /></label>
        </section>
        {p.image && (
          <section className="admin-panel">
            <h2>Photo</h2>
            <div className="admin-preview"><Photo src={p.image} alt={p.name} sizes="260px" /></div>
          </section>
        )}
        <div className="admin-actions">
          {state?.error && <p className="auth-alert" role="alert">{state.error}</p>}
          {state?.ok && <p className="admin-ok" role="status">Saved. The shop is updated.</p>}
          <button type="submit" className="btn btn-solid auth-submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
        </div>
      </aside>
    </form>
  );
}
