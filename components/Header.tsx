"use client";

import { useEffect, useState } from "react";
import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { PRODUCTS, formatPrice, type Category } from "@/lib/products";

const NAV: { label: string; target: Category | null }[] = [
  { label: "New", target: null },
  { label: "Dresses", target: "dresses" },
  { label: "Tops", target: "tops" },
  { label: "Skirts", target: "skirts" },
  { label: "Pants", target: "pants" },
];

export default function Header() {
  const { cartCount, filter, showCategory, menuOpen, setMenuOpen, setCartOpen, setSearchOpen } = useShop();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sticky header that hides on scroll down and returns on scroll up.
  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - last) > 6) { setHidden(y > last && y > 240); last = y; }
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="announce"><span>Free shipping on orders above Rs 12,000</span></div>
      <header className={`header${hidden && !menuOpen ? " hide" : ""}${scrolled ? " scrolled" : ""}`}>
        <div className="wide header-inner">
          <button className="menu-btn" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span />
          </button>
          <nav className={`nav ${menuOpen ? "open" : ""}`} aria-label="Primary">
            {NAV.map((n) => {
              const list = PRODUCTS.filter((p) => (n.target ? p.category === n.target : p.badge === "New")).slice(0, 4);
              return (
                <div key={n.label} className="nav-item">
                  <button className={`nav-link${n.target === filter ? " active" : ""}`} onClick={() => showCategory(n.target)}>
                    {n.label}
                  </button>
                  {list.length > 0 && (
                    <div className="mega">
                      <div className="wide mega-grid">
                        {list.map((p) => (
                          <button key={p.id} className="mega-card" onClick={() => showCategory(p.category)}>
                            <span className="mega-img"><Photo src={p.image} alt={p.name} sizes="120px" /></span>
                            <span className="mega-name">{p.name}</span>
                            <span className="mega-price">{formatPrice(p.price)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <a href="#top" className="logo" aria-label="MELI home">
            <span className="logo-mark">MELI</span>
          </a>
          <div className="header-right">
            <button className="bag" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" />
              </svg>
            </button>
            <button className="bag" aria-label={`Shopping bag, ${cartCount} items`} onClick={() => setCartOpen(true)}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              {cartCount > 0 && <span key={cartCount} className="bag-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
