"use client";

import { useEffect, useRef, useState } from "react";

/** Fade-up on scroll (like AOS "fade-up"). Content stays visible without JS. */
export default function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"ssr" | "hidden" | "in">("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setState("in"); return; }
    setState("hidden");
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setState("in"); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} ${state === "hidden" ? "reveal" : state === "in" ? "reveal in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
