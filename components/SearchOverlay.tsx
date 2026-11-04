"use client";

import { useEffect, useRef, useState } from "react";
import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { PRODUCTS, formatPrice } from "@/lib/products";

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, showCategory } = useShop();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => input.current?.focus(), 250);
      return () => clearTimeout(t);
    }
    setQ("");
  }, [searchOpen]);

  const term = q.trim().toLowerCase();
  const results = term ? PRODUCTS.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(term)) : [];

  return (
    <div className={`search-root${searchOpen ? " open" : ""}`} aria-hidden={!searchOpen}>
      <div className="drawer-overlay" onClick={() => setSearchOpen(false)} />
      <div className="search-panel" role="dialog" aria-label="Search">
        <div className="wide">
          <div className="search-row">
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dresses, tops, skirts, pants…" aria-label="Search" />
            <button aria-label="Close search" onClick={() => setSearchOpen(false)}>✕</button>
          </div>
          {term && (
            <div className="search-results">
              {results.length === 0 && <p className="empty">No results for “{q}”.</p>}
              {results.map((p) => (
                <button key={p.id} className="result" onClick={() => showCategory(p.category)}>
                  <span className="line-img"><Photo src={p.image} alt={p.name} sizes="64px" /></span>
                  <span><b>{p.name}</b><br />{formatPrice(p.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
