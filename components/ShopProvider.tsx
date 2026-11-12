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
// Each signed-in customer has their own saved bag, keyed by their account id, so
// people sharing a computer never see each other's bags. Lines are product|size|colour.
const cartKey = (owner: string) => `meli-cart-v3:${owner}`;
// Older bags were saved per browser with no owner; they're discarded rather than given to whoever signs in next.
const LEGACY_KEYS = ["meli-cart-v1", "meli-cart-v2"];
/** Owner used only when customer accounts aren't connected yet. */
const GUEST = "guest";
const MAX_QTY = 10;
const SEP = "|";

type Stored = Record<string, number>;

const lineKey = (id: string, size: Size, colour: string) => [id, size, colour].join(SEP);

/** An "Add to bag" made while signed out, finished after signing in. */
type PendingAdd = { id: string; size: Size; colour: string; at: number };
const PENDING_KEY = "meli-pending-add";
const PENDING_TTL = 60 * 60 * 1000; // 1 hour, enough to confirm a new account by email

/**
 * The signed-in customer's id, or null when signed out. Reads the local session cookie
 * (no network call unless the token needs refreshing). The bag lives in this browser
 * only, so this just decides whose bag to show; nothing is fetched from other accounts.
 */
async function currentOwner(): Promise<string | null> {
  if (!supabaseReady) return GUEST; // accounts not connected yet: don't block the shop
  try {
    const { data } = await createClient().auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
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
  /** Whose bag to show: account id, null when signed out, undefined while checking. */
  const [owner, setOwner] = useState<string | null | undefined>(undefined);
  /** Which owner's saved bag is currently in `items`; saving only happens when it matches `owner`. */
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);
  const [cartOpen, setCartOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(null);
  const router = useRouter();

  // Find out who is signed in, and follow sign-in / sign-out in this tab and others.
  useEffect(() => {
    try { LEGACY_KEYS.forEach((k) => window.localStorage.removeItem(k)); } catch { /* ignore */ }
    let active = true;
    currentOwner().then((o) => { if (active) setOwner(o); });
    if (!supabaseReady) return () => { active = false; };
    const { data } = createClient().auth.onAuthStateChange((_event, session) => {
      if (active) setOwner(session?.user.id ?? null);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  // Load the bag that belongs to the current owner (empty when signed out).
  useEffect(() => {
    if (owner === undefined) return;
    setCartOpen(false);
    if (owner === null) { setItems({}); setLoadedFor(null); return; }
    const clean: Stored = {};
    try {
      const raw = window.localStorage.getItem(cartKey(owner));
      const parsed = raw ? (JSON.parse(raw) as Stored) : {};
      for (const [key, qty] of Object.entries(parsed)) {
        if (parseKey(key, products) && Number.isFinite(qty) && qty > 0) clean[key] = Math.min(MAX_QTY, Math.floor(qty));
      }
    } catch {
      /* storage unavailable or corrupt: start with an empty bag */
    }
    setItems(clean);
    setLoadedFor(owner);
    // products only filter out discontinued lines; re-reading on every catalogue change isn't needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner]);

  // Save changes to the current owner's bag only.
  useEffect(() => {
    if (!loadedFor || loadedFor !== owner) return;
    try {
      window.localStorage.setItem(cartKey(loadedFor), JSON.stringify(items));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [items, loadedFor, owner]);

  const putInBag = useCallback((id: string, size: Size, colour: string) => {
    const key = lineKey(id, size, colour);
    setItems((prev) => ({ ...prev, [key]: Math.min(MAX_QTY, (prev[key] ?? 0) + 1) }));
    setCartOpen(true);
  }, []);

  // Shoppers must be signed in to use the bag. Signed-out shoppers are sent to /login;
  // their pick is remembered and added once they come back signed in.
  const addToBag = useCallback(async (id: string, size: Size, colour: string) => {
    if (await currentOwner()) { putInBag(id, size, colour); return; }
    try {
      window.localStorage.setItem(PENDING_KEY, JSON.stringify({ id, size, colour, at: Date.now() } satisfies PendingAdd));
    } catch { /* storage blocked: they'll just pick again after signing in */ }
    const here = window.location.pathname + window.location.search;
    router.push(`/login?next=${encodeURIComponent(here)}&reason=bag`);
  }, [putInBag, router]);

  // Back from signing in (or confirming a new account): finish the pending add.
  // Runs once the signed-in customer's own bag has loaded, so the pick lands in their bag.
  useEffect(() => {
    if (!loadedFor || loadedFor !== owner) return;
    let raw: string | null = null;
    try { raw = window.localStorage.getItem(PENDING_KEY); } catch { return; }
    if (!raw) return;
    try { window.localStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
    try {
      const p = JSON.parse(raw) as PendingAdd;
      if (Date.now() - p.at > PENDING_TTL) return;
      if (parseKey(lineKey(p.id, p.size, p.colour), products)) putInBag(p.id, p.size, p.colour);
    } catch { /* corrupt: drop it */ }
  }, [loadedFor, owner, products, putInBag]);
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
