"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SIZES, type Category, type Product, type Size } from "@/lib/products";

type Filter = Category | null;
export type CartLine = { key: string; product: Product; size: Size; colour: string; qty: number };

type Shop = {
  /** Live catalogue (from Supabase, or the built-in list). */
  products: Product[];
  /** Total number of items in the bag. */
  cartCount: number;
  cartLines: CartLine[];
  cartSubtotal: number;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Adds one of the product in the chosen size/colour and opens the cart drawer. */
  addToBag: (id: string, size: Size, colour: string) => void;
  /** Line actions take the cart line key. */
  setQty: (key: string, qty: number) => void;
  removeFromBag: (key: string) => void;
  clearBag: () => void;
  /** Product shown in the detail popup (null = closed). */
  viewing: Product | null;
  openProduct: (id: string) => void;
  closeProduct: () => void;
  filter: Filter;
  /** Sets the product filter (null = all) and scrolls to the product grid. */
  showCategory: (c: Filter) => void;
};

const Ctx = createContext<Shop | null>(null);
// v2: lines are keyed by product, size and colour.
const STORAGE_KEY = "meli-cart-v2";
const MAX_QTY = 10;
const SEP = "|";

type Stored = Record<string, number>;

const lineKey = (id: string, size: Size, colour: string) => [id, size, colour].join(SEP);

function parseKey(key: string, products: Product[]) {
  const [id, size, colour] = key.split(SEP);
  const product = products.find((p) => p.id === id);
  if (!product || !(SIZES as readonly string[]).includes(size) || !product.colours.some((c) => c.name === colour)) return null;
  return { product, size: size as Size, colour };
}

export function ShopProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const [items, setItems] = useState<Stored>({});
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(null);

  // Restore the bag after mount (keeps server and first client render identical).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored;
        const clean: Stored = {};
        for (const [key, qty] of Object.entries(parsed)) {
          if (parseKey(key, products) && Number.isFinite(qty) && qty > 0) clean[key] = Math.min(MAX_QTY, Math.floor(qty));
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

  const addToBag = useCallback((id: string, size: Size, colour: string) => {
    const key = lineKey(id, size, colour);
    setItems((prev) => ({ ...prev, [key]: Math.min(MAX_QTY, (prev[key] ?? 0) + 1) }));
    setCartOpen(true);
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else next[key] = Math.min(MAX_QTY, qty);
      return next;
    });
  }, []);
  const removeFromBag = useCallback((key: string) => setItems((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  }), []);
  const clearBag = useCallback(() => setItems({}), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openProduct = useCallback((id: string) => setViewingId(id), []);
  const closeProduct = useCallback(() => setViewingId(null), []);

  const showCategory = useCallback((c: Filter) => {
    setFilter(c);
    requestAnimationFrame(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const cartLines = useMemo<CartLine[]>(
    () => Object.entries(items).flatMap(([key, qty]) => {
      const line = parseKey(key, products);
      return line ? [{ key, qty, ...line }] : [];
    }),
    [items, products],
  );
  const cartCount = useMemo(() => cartLines.reduce((n, l) => n + l.qty, 0), [cartLines]);
  const cartSubtotal = useMemo(() => cartLines.reduce((n, l) => n + l.qty * l.product.price, 0), [cartLines]);
  const viewing = useMemo(() => products.find((p) => p.id === viewingId) ?? null, [products, viewingId]);

  const value = useMemo(
    () => ({ products, cartCount, cartLines, cartSubtotal, cartOpen, openCart, closeCart, addToBag, setQty, removeFromBag, clearBag, viewing, openProduct, closeProduct, filter, showCategory }),
    [products, cartCount, cartLines, cartSubtotal, cartOpen, openCart, closeCart, addToBag, setQty, removeFromBag, clearBag, viewing, openProduct, closeProduct, filter, showCategory],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside ShopProvider");
  return v;
}
