"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS, type Category, type Product } from "@/lib/products";

type Filter = Category | null;
export type CartLine = { product: Product; qty: number };

type Shop = {
  /** Total number of items in the bag. */
  cartCount: number;
  cartLines: CartLine[];
  cartSubtotal: number;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Adds one of the product to the bag and opens the cart drawer. */
  addToBag: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  removeFromBag: (id: string) => void;
  clearBag: () => void;
  filter: Filter;
  /** Sets the product filter (null = all) and scrolls to the product grid. */
  showCategory: (c: Filter) => void;
};

const Ctx = createContext<Shop | null>(null);
const STORAGE_KEY = "meli-cart-v1";
const MAX_QTY = 10;

type Stored = Record<string, number>;

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Stored>({});
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>(null);

  // Restore the bag after mount (keeps server and first client render identical).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored;
        const clean: Stored = {};
        for (const [id, qty] of Object.entries(parsed)) {
          if (PRODUCTS.some((p) => p.id === id) && Number.isFinite(qty) && qty > 0) clean[id] = Math.min(MAX_QTY, Math.floor(qty));
        }
        setItems(clean);
      }
    } catch {
      /* storage unavailable or corrupt: start with an empty bag */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [items, loaded]);

  const addToBag = useCallback((id: string) => {
    setItems((prev) => ({ ...prev, [id]: Math.min(MAX_QTY, (prev[id] ?? 0) + 1) }));
    setCartOpen(true);
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(MAX_QTY, qty);
      return next;
    });
  }, []);
  const removeFromBag = useCallback((id: string) => setItems((prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  }), []);
  const clearBag = useCallback(() => setItems({}), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const showCategory = useCallback((c: Filter) => {
    setFilter(c);
    requestAnimationFrame(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const cartLines = useMemo<CartLine[]>(
    () => Object.entries(items).flatMap(([id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      return product ? [{ product, qty }] : [];
    }),
    [items],
  );
  const cartCount = useMemo(() => cartLines.reduce((n, l) => n + l.qty, 0), [cartLines]);
  const cartSubtotal = useMemo(() => cartLines.reduce((n, l) => n + l.qty * l.product.price, 0), [cartLines]);

  const value = useMemo(
    () => ({ cartCount, cartLines, cartSubtotal, cartOpen, openCart, closeCart, addToBag, setQty, removeFromBag, clearBag, filter, showCategory }),
    [cartCount, cartLines, cartSubtotal, cartOpen, openCart, closeCart, addToBag, setQty, removeFromBag, clearBag, filter, showCategory],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside ShopProvider");
  return v;
}
