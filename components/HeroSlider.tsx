"use client";

import { useEffect, useState } from "react";
import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import type { Category } from "@/lib/products";

type Slide = { image: string; title: string; desc: string; category?: Category };

export function Arrow() {
  return (
    <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

/** Full-width fade slider: 3s autoplay, slow zoom on the active slide, dots bottom-right. */
export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const { showCategory } = useShop();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <section className="hero-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="Featured">
      {slides.map((s, n) => (
        <div key={s.title} className={`slide${n === i ? " active" : ""}`} aria-hidden={n !== i}>
          <Photo src={s.image} alt="" sizes="100vw" className="slide-bg" priority={n === 0} />
          <div className="slide-fg">
            <Photo src={s.image} alt={s.title} sizes="(max-width: 900px) 90vw, 560px" priority={n === 0} className="zoom" />
          </div>
          <div className="slide-shade" />
          <div className="wide slide-text">
            <h1>{s.title}</h1>
            <p>{s.desc}</p>
            <a href="#shop" className="btn btn-light" onClick={() => showCategory(s.category ?? null)}>
              <span>Shop now</span>
              <Arrow />
            </a>
          </div>
        </div>
      ))}
      <div className="dots" role="tablist">
        {slides.map((s, n) => (
          <button key={s.title} role="tab" aria-selected={n === i} aria-label={`Slide ${n + 1}`} className={n === i ? "on" : ""} onClick={() => setI(n)} />
        ))}
      </div>
    </section>
  );
}
