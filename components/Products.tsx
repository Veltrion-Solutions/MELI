"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { CATEGORIES, formatPrice } from "@/lib/products";

export default function Products() {
  const { products, filter, showCategory, openProduct } = useShop();
  const list = filter ? products.filter((p) => p.category === filter) : products;
  const title = filter ? CATEGORIES.find((c) => c.id === filter)!.label : "New arrivals";

  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [filter, update]);

  const slide = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>(".product");
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (card.offsetWidth + gap) * 2, behavior: "smooth" });
  };

  return (
    <section className="section products" id="shop">
      <div className="container">
        <div className="section-head split">
          <div>
            <p className="eyebrow">{filter ? "In focus" : "Just landed"}</p>
            <h2>{title}</h2>
          </div>
          <div className="head-side">
            {filter && <button className="show-all" onClick={() => showCategory(null)}>Show all</button>}
            <p>Soft neutrals, sweet gingham and breezy maxis — pieces to wear on repeat.</p>
            <div className="carousel-arrows">
              <button type="button" className="carousel-arrow" aria-label="Previous products" disabled={edge.start} onClick={() => slide(-1)}>←</button>
              <button type="button" className="carousel-arrow" aria-label="Next products" disabled={edge.end} onClick={() => slide(1)}>→</button>
            </div>
          </div>
        </div>
        <div className="product-carousel" ref={track}>
          {list.map((p) => (
            <article key={p.id} className="product">
              <div className="product-img">
                <button type="button" className="product-open" aria-label={`View ${p.name} details`} onClick={() => openProduct(p.id)} />
                <Photo src={p.image} alt={p.name} sizes="(max-width: 600px) 60vw, (max-width: 900px) 44vw, (max-width: 1100px) 32vw, 340px" />
                {p.hoverImage && (
                  <div className="product-alt"><Photo src={p.hoverImage} alt={`${p.name} alternate view`} sizes="(max-width: 600px) 60vw, (max-width: 900px) 44vw, (max-width: 1100px) 32vw, 340px" /></div>
                )}
                {p.badge && <span className="badge">{p.badge}</span>}
                <button type="button" className="add-btn" onClick={() => openProduct(p.id)}>Quick view</button>
              </div>
              <h3><button type="button" className="product-name" onClick={() => openProduct(p.id)}>{p.name}</button></h3>
              <p className="price">{formatPrice(p.price)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
