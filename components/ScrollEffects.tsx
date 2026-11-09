"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Elements that fade up as they enter the viewport (staggered by 100ms per sibling). */
const REVEAL = [
  ".hero-copy > *",
  ".section-head",
  ".back-btn",
  ".collection-toolbar",
  ".cat-card",
  ".product",
  ".promo-img",
  ".story-copy > *",
  ".review",
  ".newsletter .container > *",
  ".footer-grid > div",
];

export default function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const onScroll = () => root.toggleAttribute("data-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let io: IntersectionObserver | undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
      );
      for (const sel of REVEAL) {
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          if (el.classList.contains("in") || !el.parentElement) return;
          const idx = Array.from(el.parentElement.children).filter((c) => c.matches(sel)).indexOf(el);
          el.style.setProperty("--d", `${Math.min(Math.max(idx, 0), 5) * 100}ms`);
          el.classList.add("reveal");
          io!.observe(el);
        });
      }
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, [pathname]);

  return null;
}
