"use client";

import { useShop } from "./ShopProvider";

const icon = (d: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

/** Bottom navigation bar on phones. */
export default function MobileDock() {
  const { menuOpen, setMenuOpen, setSearchOpen, setCartOpen, cartCount } = useShop();
  return (
    <nav className="dock" aria-label="Quick navigation">
      <a href="#top" onClick={() => setMenuOpen(false)}>{icon("M3 11l9-8 9 8M5 10v10h14V10")}<span>Home</span></a>
      <button onClick={() => { scrollTo({ top: 0, behavior: "smooth" }); setMenuOpen(!menuOpen); }}>{icon("M4 7h16M4 12h16M4 17h16")}<span>Menu</span></button>
      <button onClick={() => setSearchOpen(true)}>{icon("M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z")}<span>Search</span></button>
      <button onClick={() => setCartOpen(true)}>{icon("M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2")}<span>Bag{cartCount > 0 ? ` (${cartCount})` : ""}</span></button>
    </nav>
  );
}
