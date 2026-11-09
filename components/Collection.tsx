"use client";

import { useEffect, useMemo, useState } from "react";
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

const PRICE_RANGES = [
  { id: "under-7000", label: "Under Rs 7,000", test: (n: number) => n < 7000 },
  { id: "7000-9999", label: "Rs 7,000 – 9,999", test: (n: number) => n >= 7000 && n < 10000 },
  { id: "10000-plus", label: "Rs 10,000 and above", test: (n: number) => n >= 10000 },
];
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

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function Collection({ name }: { name: CollectionKey }) {
  const { addToBag } = useShop();
  const router = useRouter();
  const goBack = () => (window.history.length > 1 ? router.back() : router.push("/"));
  const c = COLLECTIONS[name];
  const hasFilters = name !== "new";

  const [sort, setSort] = useState<SortId>("featured");
  const [prices, setPrices] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const base = useMemo(() => PRODUCTS.filter((p) => (name === "new" ? p.badge === "New" : p.category === name)), [name]);
  const list = useMemo(() => {
    let out = base;
    if (prices.length) out = out.filter((p) => PRICE_RANGES.some((r) => prices.includes(r.id) && r.test(p.price)));
    if (tags.length) out = out.filter((p) => p.badge && tags.includes(p.badge));
    if (sort !== "featured") out = [...out].sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
    return out;
  }, [base, prices, tags, sort]);

  const active = prices.length + tags.length;
  const clear = () => { setPrices([]); setTags([]); };

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
            <button type="button" className="filter-toggle" onClick={() => setDrawer(true)} aria-expanded={drawer}>
              Filter{active > 0 ? ` (${active})` : ""}
            </button>
          )}
          <p className="result-count">{list.length} {list.length === 1 ? "piece" : "pieces"}</p>
          <label className="sort-select">
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortId)}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>

        <div className={hasFilters ? "collection-layout" : undefined}>
          {hasFilters && (
            <>
              <div className={`filter-overlay${drawer ? " open" : ""}`} onClick={() => setDrawer(false)} />
              <aside className={`filters${drawer ? " open" : ""}`} aria-label="Filters">
                <div className="filters-head">
                  <p className="filter-heading">Filter</p>
                  <button type="button" className="filters-close" aria-label="Close filters" onClick={() => setDrawer(false)}>×</button>
                </div>
                <div className="filter-group">
                  <p className="filter-title">Price</p>
                  {PRICE_RANGES.map((r) => (
                    <label key={r.id} className="filter-opt">
                      <input type="checkbox" checked={prices.includes(r.id)} onChange={() => setPrices((p) => toggle(p, r.id))} />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
                <div className="filter-group">
                  <p className="filter-title">Show only</p>
                  {TAGS.map((t) => (
                    <label key={t.id} className="filter-opt">
                      <input type="checkbox" checked={tags.includes(t.id)} onChange={() => setTags((p) => toggle(p, t.id))} />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
                <div className="filters-foot">
                  <button type="button" className="btn btn-solid filters-apply" onClick={() => setDrawer(false)}>View {list.length} {list.length === 1 ? "piece" : "pieces"}</button>
                  {active > 0 && <button type="button" className="filter-clear" onClick={clear}>Clear all</button>}
                </div>
              </aside>
            </>
          )}

          <div className="collection-results">
            {list.length === 0 ? (
              <p className="empty-note">No pieces match these filters. <button type="button" className="filter-clear" onClick={clear}>Clear all</button></p>
            ) : (
              <div className="grid-4 product-grid">
                {list.map((p) => (
                  <article key={p.id} className="product">
                    <div className="product-img">
                      <Photo src={p.image} alt={p.name} sizes="(max-width: 900px) 45vw, 234px" />
                      {p.hoverImage && (
                        <div className="product-alt"><Photo src={p.hoverImage} alt={`${p.name} alternate view`} sizes="(max-width: 900px) 45vw, 234px" /></div>
                      )}
                      {p.badge && <span className="badge">{p.badge}</span>}
                      <button className="add-btn" onClick={addToBag}>Add to bag</button>
                    </div>
                    <h3>{p.name}</h3>
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
