"use client";

import Photo from "./Photo";
import Reveal from "./Reveal";
import { useShop } from "./ShopProvider";
import { CATEGORIES } from "@/lib/products";

export default function Categories() {
  const { showCategory } = useShop();
  return (
    <section className="categories">
      <div className="grid-4">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.id} delay={i * 90}>
            <a href="#shop" className="cat-card" onClick={() => showCategory(c.id)}>
              <div className="cat-img"><Photo src={c.image} alt={c.label} sizes="(max-width: 900px) 50vw, 25vw" /></div>
              <span className="cat-label">{c.label}</span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
