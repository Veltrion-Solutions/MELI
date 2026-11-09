"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShop } from "./ShopProvider";

const NAV = [
  { label: "New", href: "/new" },
  { label: "Dresses", href: "/dresses" },
  { label: "Tops", href: "/tops" },
];

export default function Header() {
  const { cartCount } = useShop();
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
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`nav-link${pathname === n.href ? " active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="logo" aria-label="MELI home">
            <span className="logo-mark">MELI</span>
            <span className="logo-sub">Wear MELI</span>
          </Link>
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
