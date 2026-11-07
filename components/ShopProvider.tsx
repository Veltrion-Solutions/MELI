"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Category } from "@/lib/products";

type Filter = Category | null;

type Shop = {
  cartCount: number;
  addToBag: () => void;
  filter: Filter;
  /** Sets the product filter (null = all) and scrolls to the product grid. */
  showCategory: (c: Filter) => void;
};

const Ctx = createContext<Shop | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [filter, setFilter] = useState<Filter>(null);

  const addToBag = useCallback(() => setCartCount((n) => n + 1), []);
  const showCategory = useCallback((c: Filter) => {
    setFilter(c);
    requestAnimationFrame(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const value = useMemo(() => ({ cartCount, addToBag, filter, showCategory }), [cartCount, addToBag, filter, showCategory]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside ShopProvider");
  return v;
}
