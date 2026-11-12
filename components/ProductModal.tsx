"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { FREE_SHIPPING_MIN, SIZES, SIZE_CHART, formatPrice, type Product, type Size } from "@/lib/products";

export default function ProductModal() {
  const { viewing, closeProduct } = useShop();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewing) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeProduct();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, [viewing, closeProduct]);

  if (!viewing) return null;

  return (
    <div className="pd-overlay" onClick={closeProduct}>
      <div
        ref={panel}
        tabIndex={-1}
        className="pd"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pd-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="pd-close" aria-label="Close details" onClick={closeProduct}>×</button>
        {/* Keyed so picks reset when a different product opens. */}
        <Details key={viewing.id} product={viewing} />
      </div>
    </div>
  );
}

function Details({ product: p }: { product: Product }) {
  const { addToBag, closeProduct } = useShop();
  const [shot, setShot] = useState(0);
  const [colour, setColour] = useState(p.colours[0].name);
  const [size, setSize] = useState<Size | null>(null);
  const [needSize, setNeedSize] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const gallery = p.gallery.length ? p.gallery : p.image ? [p.image] : [];

  const add = () => {
    if (!size) { setNeedSize(true); return; }
    closeProduct();
    void addToBag(p.id, size, colour);
  };

  return (
    <div className="pd-grid">
      <div className="pd-media">
        <div className="pd-main">
          <Photo src={gallery[shot]} alt={`${p.name}, view ${shot + 1} of ${gallery.length}`} sizes="(max-width: 800px) 100vw, 480px" />
          {p.badge && <span className="badge">{p.badge}</span>}
        </div>
        {gallery.length > 1 && (
          <div className="pd-thumbs" role="group" aria-label="Product photos">
            {gallery.map((src, i) => (
              <button key={src} type="button" className="pd-thumb" aria-label={`Show photo ${i + 1}`} aria-pressed={shot === i} onClick={() => setShot(i)}>
                <Photo src={src} alt="" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pd-info">
        <p className="eyebrow">{p.category === "dresses" ? "Dress" : "Top"}</p>
        <h2 id="pd-title" className="pd-name">{p.name}</h2>
        <p className="pd-price">{formatPrice(p.price)}</p>
        <p className="pd-desc">{p.description}</p>

        <div className="pd-opt">
          <p className="pd-label">Colour: <span>{colour}</span></p>
          <div className="pd-swatches" role="radiogroup" aria-label="Colour">
            {p.colours.map((c) => (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={colour === c.name}
                aria-label={c.name}
                title={c.name}
                className="pd-swatch"
                style={{ background: c.hex }}
                onClick={() => setColour(c.name)}
              />
            ))}
          </div>
        </div>

        <div className="pd-opt">
          <div className="pd-label-row">
            <p className="pd-label">Size{size && <>: <span>{size}</span></>}</p>
            <button type="button" className="pd-link" aria-expanded={chartOpen} onClick={() => setChartOpen((o) => !o)}>Size guide</button>
          </div>
          <div className="pd-sizes" role="radiogroup" aria-label="Size">
            {SIZES.map((s) => {
              const ok = p.inStock.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  disabled={!ok}
                  className="pd-size"
                  aria-label={ok ? s : `${s}, sold out`}
                  onClick={() => { setSize(s); setNeedSize(false); }}
                >{s}</button>
              );
            })}
          </div>
          {needSize && <p className="pd-error" role="alert">Please choose a size.</p>}
          {chartOpen && (
            <div className="pd-chart">
              <table className="size-table">
                <caption className="sr-only">Body measurements in centimetres</caption>
                <thead><tr><th scope="col">Size</th><th scope="col">UK</th><th scope="col">Bust</th><th scope="col">Waist</th><th scope="col">Hips</th></tr></thead>
                <tbody>
                  {SIZE_CHART.map((r) => (
                    <tr key={r.size} aria-current={size === r.size || undefined}>
                      <th scope="row">{r.size}</th><td>{r.uk}</td>
                      <td>{r.bust.join("–")}</td><td>{r.waist.join("–")}</td><td>{r.hips.join("–")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="pd-small">Measurements in cm. <Link href="/size-guide" onClick={closeProduct}>Full size guide &amp; how to measure</Link></p>
            </div>
          )}
        </div>

        <button type="button" className="btn btn-solid pd-add" onClick={add}>
          Add to bag — {formatPrice(p.price)}
        </button>
        <p className="pd-small">Free shipping on orders over {formatPrice(FREE_SHIPPING_MIN)}.</p>

        <details className="pd-more" open>
          <summary>Details &amp; care</summary>
          <ul>{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
        </details>
      </div>
    </div>
  );
}
