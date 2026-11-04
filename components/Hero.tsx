import Photo from "./Photo";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wide hero-grid">
        <div className="hero-overlay">
          <p className="eyebrow">The Summer Edit · 2026</p>
          <h1>Soft days, well dressed.</h1>
          <p className="hero-text">Easy dresses, tailored-feeling separates and fabrics that feel as good as they look.</p>
          <div className="hero-cta">
            <a href="#shop" className="btn btn-solid">Shop new arrivals</a>
          </div>
        </div>
        <div className="hero-arch">
          <Photo src="/images/hero.jpg" alt="Model wearing the Marisol Maxi" sizes="(max-width: 900px) 90vw, 480px" priority />
        </div>
      </div>
    </section>
  );
}
