"use client";

import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { CATEGORIES } from "@/lib/products";

export default function Categories() {
  const { showCategory } = useShop();
  return (
    <section className="section categories">
      <div className="container">
        <div className="section-head center">
          <p className="eyebrow">Discover</p>
          <h2>Shop by category</h2>
        </div>
        <div className="grid-4">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="cat-card" onClick={() => showCategory(c.id)}>
              <div className="cat-img"><Photo src={c.image} alt={c.label} sizes="(max-width: 1380px) 50vw, 690px" /></div>
              <span className="cat-label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
