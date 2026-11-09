"use client";

import { useEffect, useState } from "react";
import Photo from "./Photo";
import { PRODUCTS, FEATURED_ID, formatPrice } from "@/lib/products";

const SLIDES = PRODUCTS.filter((p) => p.image);
const START = Math.max(0, SLIDES.findIndex((p) => p.id === FEATURED_ID));
const INTERVAL = 5000;

/** Auto-playing cross-fade slideshow with a slow zoom on the active slide and dot navigation. */
export default function HeroSlides() {
  const [i, setI] = useState(START);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused]);

  const cur = SLIDES[i];

  return (
    <>
    <div className="hero-backdrop" aria-hidden>
      {SLIDES.map((p, idx) => (
        <div key={p.id} className={`hero-bgslide${idx === i ? " active" : ""}`}>
          <Photo src={p.image} alt="" sizes="30vw" />
        </div>
      ))}
    </div>
    <div
      className="hero-visual"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-arch">
        {SLIDES.map((p, idx) => (
          <div key={p.id} className={`hero-slide${idx === i ? " active" : ""}`} aria-hidden={idx !== i}>
            <Photo src={p.image} alt={`Model wearing the ${p.name}`} sizes="(max-width: 900px) 90vw, 460px" priority={idx === START} />
          </div>
        ))}
      </div>
      <div className="featured-card" key={cur.id} aria-live="polite">
        <span className="eyebrow">Featured</span>
        <p>{cur.name} · {formatPrice(cur.price)}</p>
      </div>
      <div className="hero-dots" role="group" aria-label="Choose slide">
        {SLIDES.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            className={`hero-dot${idx === i ? " active" : ""}`}
            aria-label={`Show ${p.name}`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
          />
        ))}
      </div>
    </div>
    </>
  );
}
