import HeroSlides from "./HeroSlides";

export default function Hero() {
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
        <HeroSlides />
      </div>
    </section>
  );
}
