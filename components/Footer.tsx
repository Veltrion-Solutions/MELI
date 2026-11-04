"use client";

import { useEffect, useRef, useState } from "react";

const COLS = [
  { title: "Shop by category", links: ["New arrivals", "Dresses", "Tops", "Skirts", "Pants"] },
  { title: "Information", links: ["About us", "Contact us", "Size guide", "Careers"] },
  { title: "Terms of use", links: ["Terms & conditions", "Privacy policy", "Shipping & returns", "Track orders"] },
];

/** Footer stays pinned behind the page and is revealed as you reach the bottom (desktop). Columns collapse into accordions on phones. */
export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--footer-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <footer className="footer" ref={ref}>
      <div className="wide footer-grid">
        {COLS.map((c) => (
          <div key={c.title} className={`foot-col${open === c.title ? " open" : ""}`}>
            <button className="foot-title" aria-expanded={open === c.title} onClick={() => setOpen(open === c.title ? null : c.title)}>
              {c.title}<span aria-hidden>+</span>
            </button>
            <ul>{c.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
        ))}
        <div className="foot-news">
          <p className="foot-title static">Join the MELI list</p>
          <p className="footer-tag">Be first to new drops, plus 10% off your first order.</p>
          {done ? (
            <p className="thanks" role="status">Thank you — welcome to MELI.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
              <input type="email" required placeholder="Your email" aria-label="Email address" />
              <button type="submit" className="btn btn-light"><span>Subscribe</span></button>
            </form>
          )}
          <p className="social"><a href="#">Instagram</a><a href="#">Facebook</a><a href="#">TikTok</a></p>
        </div>
      </div>
      <p className="footer-logo">MELI</p>
      <p className="copyright">© 2026 MELI. All rights reserved.</p>
    </footer>
  );
}
