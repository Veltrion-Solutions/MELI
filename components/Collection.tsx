"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { PRODUCTS, formatPrice } from "@/lib/products";

export type CollectionKey = "new" | "dresses" | "tops";

export const COLLECTIONS: Record<CollectionKey, { title: string; eyebrow: string }> = {
  new: { title: "New in", eyebrow: "Just landed" },
  dresses: { title: "Dresses", eyebrow: "Collection" },
  tops: { title: "Tops", eyebrow: "Collection" },
};

const TAGS = [
  { id: "New", label: "New arrivals" },
  { id: "Best seller", label: "Best sellers" },
];
const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;
type SortId = (typeof SORTS)[number]["id"];
const COLUMN_OPTIONS = [2, 3, 4, 5];

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function Collection({ name }: { name: CollectionKey }) {
  const { openProduct } = useShop();
  const router = useRouter();
  const goBack = () => (window.history.length > 1 ? router.back() : router.push("/"));
  const c = COLLECTIONS[name];
  const hasFilters = name !== "new";

  const [sort, setSort] = useState<SortId>("featured");
  const [tags, setTags] = useState<string[]>([]);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [panel, setPanel] = useState(false);
  const [cols, setCols] = useState(4);

  const base = useMemo(() => PRODUCTS.filter((p) => (name === "new" ? p.badge === "New" : p.category === name)), [name]);
  const maxPrice = useMemo(() => Math.max(0, ...base.map((p) => p.price)), [base]);

  const list = useMemo(() => {
    let out = base;
    const lo = min === "" ? null : Number(min);
    const hi = max === "" ? null : Number(max);
    if (lo !== null && !Number.isNaN(lo)) out = out.filter((p) => p.price >= lo);
    if (hi !== null && !Number.isNaN(hi)) out = out.filter((p) => p.price <= hi);
    if (tags.length) out = out.filter((p) => p.badge && tags.includes(p.badge));
    if (sort !== "featured") out = [...out].sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
    return out;
  }, [base, tags, min, max, sort]);

  const active = tags.length + (min !== "" || max !== "" ? 1 : 0);
  const clear = () => { setTags([]); setMin(""); setMax(""); };
  const count = (tag: string) => base.filter((p) => p.badge === tag).length;

  return (
    <section className="section products collection">
      <div className="container">
        <button type="button" className="back-btn" onClick={goBack}>
          <span aria-hidden>←</span> Back
        </button>
        <div className="section-head split">
          <div>
            <p className="eyebrow">{c.eyebrow}</p>
            <h2>{c.title}</h2>
          </div>
        </div>

        <div className="collection-toolbar">
          {hasFilters && (
            <button type="button" className="filter-toggle" onClick={() => setPanel((o) => !o)} aria-expanded={panel} aria-controls="filter-panel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />
              </svg>
              Filter{active > 0 ? ` (${active})` : ""}
            </button>
          )}
          <p className="result-count">{list.length} {list.length === 1 ? "Product" : "Products"}</p>
          <div className="cols-switch" role="group" aria-label="Products per row">
            {COLUMN_OPTIONS.map((n) => (
              <button key={n} type="button" className="cols-btn" aria-pressed={cols === n} aria-label={`${n} per row`} onClick={() => setCols(n)}>
                {Array.from({ length: n }, (_, i) => <i key={i} />)}
              </button>
            ))}
          </div>
          <label className="sort-select">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortId)} aria-label="Sort by">
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.id === "featured" ? "Sort by" : s.label}</option>)}
            </select>
          </label>
        </div>

        <div className={`collection-layout${hasFilters && panel ? " panel-open" : ""}`} style={{ ["--cols" as string]: cols }}>
          {hasFilters && (
            <aside id="filter-panel" className="filters" aria-label="Filters" hidden={!panel}>
              <div className="filter-group">
                <p className="filter-title">Availability</p>
                {TAGS.map((t) => (
                  <label key={t.id} className="filter-opt">
                    <input type="checkbox" checked={tags.includes(t.id)} onChange={() => setTags((p) => toggle(p, t.id))} />
                    <span>{t.label}</span>
                    <span className="filter-count">({count(t.id)})</span>
                  </label>
                ))}
              </div>
              <div className="filter-group">
                <p className="filter-title">Price</p>
                <div className="price-row">
                  <label className="price-field">From
                    <span className="price-input">Rs <input type="number" inputMode="numeric" min={0} placeholder="0" value={min} onChange={(e) => setMin(e.target.value)} /></span>
                  </label>
                  <label className="price-field">To
                    <span className="price-input">Rs <input type="number" inputMode="numeric" min={0} placeholder={String(maxPrice)} value={max} onChange={(e) => setMax(e.target.value)} /></span>
                  </label>
                </div>
              </div>
              {active > 0 && <button type="button" className="filter-clear" onClick={clear}>Clear all</button>}
            </aside>
          )}

          <div className="collection-results">
            {list.length === 0 ? (
              <p className="empty-note">No products match these filters. <button type="button" className="filter-clear" onClick={clear}>Clear all</button></p>
            ) : (
              <div className="grid-4 product-grid">
                {list.map((p) => (
                  <article key={p.id} className="product">
                    <div className="product-img">
                      <button type="button" className="product-open" aria-label={`View ${p.name} details`} onClick={() => openProduct(p.id)} />
                      <Photo src={p.image} alt={p.name} sizes="(max-width: 600px) 50vw, (max-width: 1100px) 34vw, 340px" />
                      {p.hoverImage && (
                        <div className="product-alt"><Photo src={p.hoverImage} alt={`${p.name} alternate view`} sizes="(max-width: 600px) 50vw, (max-width: 1100px) 34vw, 340px" /></div>
                      )}
                      {p.badge && <span className="badge">{p.badge}</span>}
                      <button type="button" className="add-btn" onClick={() => openProduct(p.id)}>Quick view</button>
                    </div>
                    <h3><button type="button" className="product-name" onClick={() => openProduct(p.id)}>{p.name}</button></h3>
                    <p className="price">{formatPrice(p.price)}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
