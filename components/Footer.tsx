import Link from "next/link";

const COLS = [
  { title: "Shop", links: ["Dresses", "Tops", "Skirts", "Pants"] },
  { title: "Help", links: ["Shipping", "Returns", "Size guide", "Contact"] },
  { title: "Follow", links: ["Instagram", "Facebook", "TikTok"] },
];

/** Footer links that have a real page; the rest are still placeholders. */
const PAGES: Record<string, string> = {
  Dresses: "/dresses",
  Tops: "/tops",
  Shipping: "/shipping-returns#shipping",
  Returns: "/shipping-returns#returns",
  "Size guide": "/size-guide",
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-logo">MELI</p>
          <p className="footer-tag">Soft days, well dressed.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="eyebrow">{c.title}</p>
            <ul>{c.links.map((l) => <li key={l}>{PAGES[l] ? <Link href={PAGES[l]}>{l}</Link> : <a href="#">{l}</a>}</li>)}</ul>
          </div>
        ))}
      </div>
      <p className="copyright">© 2026 MELI. All rights reserved.</p>
    </footer>
  );
}
