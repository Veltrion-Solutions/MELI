"use client";

import { useEffect, useRef } from "react";
import Photo from "./Photo";
import { Arrow } from "./HeroSlider";

/** Full-width image banner: the background drifts slower than the page; "Shop now" sits bottom-right. */
export default function ParallaxBanner({ image, title, href }: { image: string; title: string; href: string }) {
  const wrap = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = wrap.current?.getBoundingClientRect();
      if (r && bg.current && r.bottom > 0 && r.top < innerHeight) {
        bg.current.style.transform = `translate3d(0, ${(r.top + r.height / 2 - innerHeight / 2) * -0.15}px, 0) scale(1.2)`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="parallax-banner" ref={wrap}>
      <div className="parallax-bg" ref={bg}><Photo src={image} alt="" sizes="100vw" /></div>
      <div className="parallax-shade" />
      <div className="wide parallax-inner">
        <h2>{title}</h2>
        <a href={href} className="btn btn-light"><span>Shop now</span><Arrow /></a>
      </div>
    </section>
  );
}
