"use client";

import Photo from "./Photo";
import Reveal from "./Reveal";
import { useShop } from "./ShopProvider";
import type { Category } from "@/lib/products";

export type SplitItem = { title: string; desc?: string; image: string; href: string; category?: Category };

/** Full-bleed side-by-side image tiles; the hovered tile widens and its caption slides up (desktop). */
export default function SplitBanner({ items }: { items: SplitItem[] }) {
  const { showCategory } = useShop();
  return (
    <Reveal className="split-banner">
      <div className="split-wrap">
        {items.map((it) => (
          <a key={it.title} href={it.href} className="split-item" onClick={() => it.category && showCategory(it.category)}>
            <div className="split-image">
              <Photo src={it.image} alt={it.title} sizes="(max-width: 1024px) 75vw, 50vw" />
            </div>
            <div className="split-content">
              <h2 className="split-heading">{it.title}</h2>
              {it.desc && <p className="split-desc">{it.desc}</p>}
            </div>
          </a>
        ))}
      </div>
    </Reveal>
  );
}
