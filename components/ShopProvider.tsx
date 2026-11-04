"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Category, Product } from "@/lib/products";

type Filter = Category | null;
export type CartItem = { product: Product; qty: number };

type Shop = {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  addToBag: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  filter: Filter;
  /** Sets the product filter (null = all) and scrolls to the product row. */
  showCategory: (c: Filter) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
};

const Ctx = createContext<Shop | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState<Filter>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const addToBag = useCallback((p: Product) => {
    setItems((list) => {
      const found = list.find((i) => i.product.id === p.id);
      return found ? list.map((i) => (i === found ? { ...i, qty: i.qty + 1 } : i)) : [...list, { product: p, qty: 1 }];
    });
    setCartOpen(true);
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setItems((list) => (qty <= 0 ? list.filter((i) => i.product.id !== id) : list.map((i) => (i.product.id === id ? { ...i, qty } : i))));
  }, []);
  const showCategory = useCallback((c: Filter) => {
    setFilter(c);
    setMenuOpen(false);
    setSearchOpen(false);
    requestAnimationFrame(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  // Lock page scroll while a drawer/overlay is open; Escape closes everything.
  useEffect(() => {
    document.body.style.overflow = cartOpen || searchOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setCartOpen(false); setSearchOpen(false); setMenuOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, searchOpen]);

  const value = useMemo<Shop>(() => ({
    items,
    cartCount: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.qty * i.product.price, 0),
    addToBag, setQty, filter, showCategory,
    menuOpen, setMenuOpen, cartOpen, setCartOpen, searchOpen, setSearchOpen,
  }), [items, addToBag, setQty, filter, showCategory, menuOpen, cartOpen, searchOpen]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside ShopProvider");
  return v;
}
