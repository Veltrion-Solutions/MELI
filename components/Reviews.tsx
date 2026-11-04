import Reveal from "./Reveal";
import { REVIEWS } from "@/lib/products";

export default function Reviews() {
  return (
    <section className="section reviews">
      <div className="wide">
        <Reveal className="section-head center"><h2>Loved by our customers</h2></Reveal>
        <div className="review-grid">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 120}>
              <figure className="review">
                <div className="stars" aria-label="5 out of 5 stars">★ ★ ★ ★ ★</div>
                <blockquote>“{r.quote}”</blockquote>
                <figcaption>{r.name}, {r.city}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
