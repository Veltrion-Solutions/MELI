"use client";

import { useState } from "react";
import { useShop } from "./ShopProvider";
import type { Filter } from "./ShopProvider";

const NAV: { label: string; target: Filter }[] = [
  { label: "New", target: "new" },
  { label: "Dresses", target: "dresses" },
  { label: "Tops", target: "tops" },
];

export default function Header() {
  const { cartCount, filter, showCategory } = useShop();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="announce">Complimentary shipping over Rs 12,000 · Island-wide delivery · 30-day returns</div>
      <header className="header">
        <div className="container header-inner">
          <button className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span /><span />
          </button>
          <nav className={`nav ${open ? "open" : ""}`} aria-label="Primary">
            {NAV.map((n) => (
              <button
                key={n.label}
                className={`nav-link${n.target === filter ? " active" : ""}`}
                onClick={() => { showCategory(n.target); setOpen(false); }}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <a href="#top" className="logo" aria-label="MELI home">
            <span className="logo-mark">MELI</span>
            <span className="logo-sub">Wear MELI</span>
          </a>
          <div className="header-right">
            <button className="bag" aria-label={`Shopping bag, ${cartCount} items`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
