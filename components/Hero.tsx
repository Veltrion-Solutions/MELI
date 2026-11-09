import Photo from "./Photo";
import { PRODUCTS, FEATURED_ID, formatPrice } from "@/lib/products";

export default function Hero() {
  const featured = PRODUCTS.find((p) => p.id === FEATURED_ID)!;
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">The Summer Edit · 2026</p>
          <h1>
            Soft days,
            <br />
            <em>well</em> dressed.
          </h1>
          <p className="hero-text">
            Easy dresses, tailored-feeling separates and fabrics that feel as good as they look. Made for the way you actually live.
          </p>
          <div className="hero-cta">
            <a href="#shop" className="btn btn-solid">Shop new arrivals</a>
            <a href="#story" className="btn btn-outline">Our story</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-arch">
            <Photo src={featured.image} alt={`Model wearing the ${featured.name}`} sizes="(max-width: 900px) 80vw, 355px" priority />
          </div>
          <div className="featured-card">
            <span className="eyebrow">Featured</span>
            <p>{featured.name} · {formatPrice(featured.price)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
