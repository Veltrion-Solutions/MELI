"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShop } from "./ShopProvider";
import CartDrawer from "./CartDrawer";
import ProductModal from "./ProductModal";

const CATEGORY_LINKS = [
  { label: "Dresses", href: "/dresses" },
  { label: "Tops", href: "/tops" },
];

export default function Header() {
  const { cartCount, openCart } = useShop();
  const pathname = usePathname();
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
            <Link href="/new" className={`nav-link${pathname === "/new" ? " active" : ""}`} onClick={() => setOpen(false)}>
              New arrivals
            </Link>
            <div className="nav-item has-menu">
              <span
                className={`nav-link nav-parent${CATEGORY_LINKS.some((l) => l.href === pathname) ? " active" : ""}`}
                tabIndex={0}
                role="button"
                aria-haspopup="true"
              >
                Categories <span className="caret" aria-hidden>▾</span>
              </span>
              <div className="nav-menu">
                <p className="nav-menu-title">Categories</p>
                {CATEGORY_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className={`nav-sub${pathname === l.href ? " active" : ""}`} onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>          </nav>
          <Link href="/" className="logo" aria-label="MELI home">
            <span className="logo-mark">MELI</span>
            <span className="logo-sub">Wear MELI</span>
          </Link>
          <div className="header-right">
            <Link href="/account" className="bag" aria-label="My account" title="My account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </Link>
            <button className="bag" aria-label={`Shopping bag, ${cartCount} items`} aria-haspopup="dialog" onClick={openCart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              {cartCount > 0 && <span key={cartCount} className="bag-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer />
      <ProductModal />
    </>
  );
}
