"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SIZES, type Category, type Product, type Size } from "@/lib/products";
import { createClient } from "@/lib/supabase/client";
import { supabaseReady } from "@/lib/supabase/config";

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
  /** Adds one in the chosen size/colour and opens the bag; sends signed-out shoppers to /login first. */
  addToBag: (id: string, size: Size, colour: string) => Promise<void>;
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

/** An "Add to bag" made while signed out, finished after signing in. */
type PendingAdd = { id: string; size: Size; colour: string; at: number };
const PENDING_KEY = "meli-pending-add";
const PENDING_TTL = 60 * 60 * 1000; // 1 hour, enough to confirm a new account by email

/** Reads the local session cookie; no network call unless the token needs refreshing. */
async function isSignedIn() {
  if (!supabaseReady) return true; // accounts not connected yet: don't block the shop
  try {
    const { data } = await createClient().auth.getSession();
    return Boolean(data.session);
  } catch {
    return false;
  }
}

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
  const router = useRouter();

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

  const putInBag = useCallback((id: string, size: Size, colour: string) => {
    const key = lineKey(id, size, colour);
    setItems((prev) => ({ ...prev, [key]: Math.min(MAX_QTY, (prev[key] ?? 0) + 1) }));
    setCartOpen(true);
  }, []);

  // Shoppers must be signed in to use the bag. Signed-out shoppers are sent to /login;
  // their pick is remembered and added once they come back signed in.
  const addToBag = useCallback(async (id: string, size: Size, colour: string) => {
    if (await isSignedIn()) { putInBag(id, size, colour); return; }
    try {
      window.localStorage.setItem(PENDING_KEY, JSON.stringify({ id, size, colour, at: Date.now() } satisfies PendingAdd));
    } catch { /* storage blocked: they'll just pick again after signing in */ }
    const here = window.location.pathname + window.location.search;
    router.push(`/login?next=${encodeURIComponent(here)}&reason=bag`);
  }, [putInBag, router]);

  // Back from signing in (or confirming a new account): finish the pending add.
  useEffect(() => {
    if (!loaded) return;
    let raw: string | null = null;
    try { raw = window.localStorage.getItem(PENDING_KEY); } catch { return; }
    if (!raw) return;
    let cancelled = false;
    isSignedIn().then((ok) => {
      if (cancelled || !ok) return;
      try { window.localStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
      try {
        const p = JSON.parse(raw!) as PendingAdd;
        if (Date.now() - p.at > PENDING_TTL) return;
        if (parseKey(lineKey(p.id, p.size, p.colour), products)) putInBag(p.id, p.size, p.colour);
      } catch { /* corrupt: drop it */ }
    });
    return () => { cancelled = true; };
  }, [loaded, products, putInBag]);
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
