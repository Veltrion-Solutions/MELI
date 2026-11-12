"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { createProduct, saveProduct, type SaveState } from "@/app/admin/actions";
import { SIZES } from "@/lib/products";
import type { ProductRow } from "@/lib/catalog";
import { PRODUCT_BUCKET, createClient } from "@/lib/supabase/client";

const MAX_PHOTOS = 10;
const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** A photo already saved (url) or picked but not yet uploaded (file + local preview). */
type Photo = { key: string; url?: string; file?: File; preview: string };

let seq = 0;
const nextKey = () => `p${++seq}`;

/** Add-product form when `product` is absent; edit form otherwise. */
export default function ProductEditor({ product: p }: { product?: ProductRow }) {
  const isNew = !p;
  const [state, action, pending] = useActionState<SaveState, FormData>(isNew ? createProduct : saveProduct, undefined);
  const [photos, setPhotos] = useState<Photo[]>(() =>
    (p?.gallery?.length ? p.gallery : p?.image ? [p.image] : []).map((url) => ({ key: nextKey(), url, preview: url })),
  );
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Free local previews when photos are removed or the page closes.
  const previews = useRef(new Set<string>());
  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setPhotoError(null);
    const picked: Photo[] = [];
    for (const f of Array.from(files)) {
      if (!TYPES.includes(f.type)) { setPhotoError(`${f.name}: use JPG, PNG, WebP or AVIF.`); continue; }
      if (f.size > MAX_BYTES) { setPhotoError(`${f.name} is over 10 MB.`); continue; }
      const preview = URL.createObjectURL(f);
      previews.current.add(preview);
      picked.push({ key: nextKey(), file: f, preview });
    }
    setPhotos((cur) => {
      const room = MAX_PHOTOS - cur.length;
      if (picked.length > room) setPhotoError(`Up to ${MAX_PHOTOS} photos per product.`);
      return [...cur, ...picked.slice(0, Math.max(0, room))];
    });
    if (fileInput.current) fileInput.current.value = "";
  };

  const remove = (key: string) => setPhotos((cur) => cur.filter((ph) => ph.key !== key));
  const move = (key: string, dir: -1 | 1) =>
    setPhotos((cur) => {
      const i = cur.findIndex((ph) => ph.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  // Upload new photos straight to Supabase Storage, then send their URLs with the form.
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPhotoError(null);
    if (isNew && photos.length === 0) { setPhotoError("Add at least one photo."); return; }

    const supabase = createClient();
    const urls: string[] = [];
    setUploading(true);
    try {
      const folder = `${(String(fd.get("name") || "product")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product"}-${Date.now().toString(36)}`;
      const done: Record<string, string> = {};
      for (const [i, ph] of photos.entries()) {
        if (ph.url) { urls.push(ph.url); continue; }
        const ext = ph.file!.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${folder}/${i + 1}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, ph.file!, { contentType: ph.file!.type, cacheControl: "31536000" });
        if (error) throw new Error(`Couldn't upload ${ph.file!.name}: ${error.message}`);
        const url = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl;
        urls.push(url);
        done[ph.key] = url;
      }
      // Keep uploaded photos as saved, so a failed save doesn't upload them twice.
      setPhotos((cur) => cur.map((ph) => (done[ph.key] ? { ...ph, url: done[ph.key], file: undefined } : ph)));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed.");
      setUploading(false);
      return;
    }
    setUploading(false);

    fd.delete("images");
    urls.forEach((u) => fd.append("images", u));
    startTransition(() => action(fd));
  };

  const busy = uploading || pending;

  return (
    <form onSubmit={onSubmit} className="admin-editor" noValidate={false}>
      {p && <input type="hidden" name="id" value={p.id} />}

      <div className="admin-editor-main">
        <section className="admin-panel">
          <h2>Basics</h2>
          <label className="admin-field"><span>Name</span><input name="name" defaultValue={p?.name} required maxLength={120} placeholder="e.g. Lila Wrap Dress" /></label>
          <div className="admin-row">
            <label className="admin-field"><span>Price (Rs)</span><input name="price" inputMode="numeric" defaultValue={p?.price} required placeholder="9500" /></label>
            <label className="admin-field"><span>Category</span>
              <select name="category" defaultValue={p?.category ?? "dresses"}><option value="dresses">Dresses</option><option value="tops">Tops</option></select>
            </label>
            <label className="admin-field"><span>Badge</span>
              <select name="badge" defaultValue={p ? p.badge ?? "" : "New"}><option value="">None</option><option value="New">New</option><option value="Best seller">Best seller</option></select>
            </label>
          </div>
          <label className="admin-field"><span>Description</span><textarea name="description" rows={3} defaultValue={p?.description} /></label>
          <label className="admin-field"><span>Details &amp; care <small>One per line</small></span><textarea name="details" rows={4} defaultValue={p?.details.join("\n")} placeholder={"Lightweight cotton-linen\nMachine wash cold"} /></label>
        </section>

        <section className="admin-panel">
          <h2>Photos</h2>
          <p className="admin-hint">The first photo is the main shot and the second shows when a shopper hovers. Use the arrows to reorder. JPG, PNG, WebP or AVIF, up to 10 MB each.</p>
          <div className="admin-photos">
            {photos.map((ph, i) => (
              <figure key={ph.key} className="admin-photo">
                {/* Plain img: previews can be local blob: URLs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.preview} alt={`Photo ${i + 1}`} />
                <figcaption>
                  <span className="admin-photo-tag">{i === 0 ? "Main" : i === 1 ? "Hover" : `#${i + 1}`}{ph.file ? " · new" : ""}</span>
                  <span className="admin-photo-btns">
                    <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0 || busy} onClick={() => move(ph.key, -1)}>←</button>
                    <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === photos.length - 1 || busy} onClick={() => move(ph.key, 1)}>→</button>
                    <button type="button" aria-label={`Remove photo ${i + 1}`} disabled={busy} onClick={() => remove(ph.key)}>×</button>
                  </span>
                </figcaption>
              </figure>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="admin-photo-add">
                <input ref={fileInput} type="file" accept={TYPES.join(",")} multiple onChange={(e) => addFiles(e.target.files)} disabled={busy} />
                <span>+ Add photos</span>
              </label>
            )}
          </div>
          {photoError && <p className="admin-warn" role="alert">{photoError}</p>}
        </section>

        <section className="admin-panel">
          <h2>Colours &amp; sizes</h2>
          <label className="admin-field">
            <span>Colours <small>One per line: name then hex code, e.g. Butter #f1e7b4. The first is the colour in the photos.</small></span>
            <textarea name="colours" rows={3} defaultValue={p?.colours.map((c) => `${c.name} ${c.hex}`).join("\n")} placeholder="Butter #f1e7b4" required />
          </label>
          <fieldset className="admin-field">
            <legend>Sizes in stock</legend>
            <div className="admin-sizes">
              {SIZES.map((s) => (
                <label key={s} className="admin-size"><input type="checkbox" name="in_stock" value={s} defaultChecked={p ? p.in_stock.includes(s) : true} /><span>{s}</span></label>
              ))}
            </div>
          </fieldset>
        </section>
      </div>

      <aside className="admin-editor-side">
        <section className="admin-panel">
          <h2>Visibility</h2>
          <label className="admin-toggle"><input type="checkbox" name="active" defaultChecked={p ? p.active : true} /><span>Show in shop</span></label>
          <label className="admin-field"><span>Sort order <small>Lower shows first{isNew ? ". Leave empty to add at the end." : ""}</small></span><input name="sort" type="number" step={1} defaultValue={p?.sort} /></label>
        </section>
        <div className="admin-actions">
          {state?.error && <p className="auth-alert" role="alert">{state.error}</p>}
          {state?.ok && <p className="admin-ok" role="status">Saved. The shop is updated.</p>}
          <button type="submit" className="btn btn-solid auth-submit" disabled={busy}>
            {uploading ? "Uploading photos…" : pending ? "Saving…" : isNew ? "Add product" : "Save changes"}
          </button>
        </div>
      </aside>
    </form>
  );
}
