"use client";

import ProductRow from "./ProductRow";
import { useShop } from "./ShopProvider";
import { CATEGORIES, PRODUCTS } from "@/lib/products";

export function NewArrivals() {
  const { filter, showCategory } = useShop();
  const list = filter ? PRODUCTS.filter((p) => p.category === filter) : PRODUCTS;
  const title = filter ? CATEGORIES.find((c) => c.id === filter)!.label : "New arrivals";
  return (
    <ProductRow
      id="shop"
      title={title}
      products={list}
      action={filter ? <button className="show-all" onClick={() => showCategory(null)}>Show all</button> : null}
    />
  );
}

export function BestSellers() {
  const list = [...PRODUCTS].sort((a, b) => Number(b.badge === "Best seller") - Number(a.badge === "Best seller")).slice(0, 6);
  return <ProductRow id="best" title="Best sellers" products={list} />;
}
