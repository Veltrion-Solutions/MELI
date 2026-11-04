import { REVIEWS } from "@/lib/products";

export default function Reviews() {
  return (
    <section className="section reviews">
      <div className="wide">
        <div className="section-head center">
          <h2>Loved by our customers</h2>
        </div>
        <div className="review-grid">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="review">
              <div className="stars" aria-label="5 out of 5 stars">★ ★ ★ ★ ★</div>
              <blockquote>“{r.quote}”</blockquote>
              <figcaption>{r.name}, {r.city}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
