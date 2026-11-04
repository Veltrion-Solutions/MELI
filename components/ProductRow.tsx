"use client";

import { useEffect, useRef, useState } from "react";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { useShop } from "./ShopProvider";
import { formatPrice, type Product } from "@/lib/products";

/** Product card. With several images it cross-fades them (1.5s) while hovered, with dots. */
function Card({ p, index }: { p: Product; index: number }) {
  const { addToBag } = useShop();
  const imgs = p.images?.length ? p.images : p.image ? [p.image] : [undefined];
  const [n, setN] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!hover || imgs.length < 2) { setN(0); return; }
    const t = setInterval(() => setN((v) => (v + 1) % imgs.length), 1500);
    return () => clearInterval(t);
  }, [hover, imgs.length]);

  return (
    <Reveal delay={(index % 4) * 90} className="product">
      <div className="product-img" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {imgs.map((src, k) => (
          <div key={k} className={`product-slide${k === n ? " on" : ""}`}>
            <Photo src={src} alt={k === 0 ? p.name : ""} sizes="(max-width: 900px) 60vw, 25vw" />
          </div>
        ))}
        {p.badge && <span className="badge">{p.badge}</span>}
        {imgs.length > 1 && (
          <span className="card-dots" aria-hidden>
            {imgs.map((_, k) => <i key={k} className={k === n ? "on" : ""} />)}
          </span>
        )}
        <button className="add-btn" onClick={() => addToBag(p)}>Add to bag</button>
      </div>
      <p className="sizes">UK 04 · 06 · 08 · 10 · 12</p>
      <h3>{p.name}</h3>
      <p className="price">{formatPrice(p.price)}</p>
    </Reveal>
  );
}

export default function ProductRow({ id, title, products, action }: { id?: string; title: string; products: Product[]; action?: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  return (
    <section className="row-section" id={id}>
      <div className="wide">
        <Reveal>
          <div className="row-head">
            <h2 className="row-title">{title}{action}</h2>
            <div className="arrows">
              <button aria-label="Previous" onClick={() => scroll(-1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button aria-label="Next" onClick={() => scroll(1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </Reveal>
        <div className="track" ref={track}>
          {products.map((p, i) => <Card key={p.id} p={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
