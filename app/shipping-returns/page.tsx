import Shop from "@/components/Shop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FREE_SHIPPING_MIN, SHIPPING_RATES as RATES, formatPrice } from "@/lib/products";
import { FAQ, RETURN_STEPS, SAME_DAY_CUTOFF } from "@/lib/policies";

export const metadata = { title: "Shipping & returns - MELI" };

export default function Page() {
  return (
    <Shop>
      <Header />
      <main className="policy">
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Help</p>
              <h1>Shipping &amp; returns</h1>
            </div>
            <nav className="policy-jump" aria-label="On this page">
              <a href="#shipping">Shipping</a>
              <a href="#returns">Returns</a>
              <a href="#faq">Questions</a>
            </nav>

            <div className="policy-highlights">
              <div className="policy-card"><p className="policy-card-title">Free shipping</p><p>On orders over {formatPrice(FREE_SHIPPING_MIN)}</p></div>
              <div className="policy-card"><p className="policy-card-title">Island-wide delivery</p><p>To every district in Sri Lanka</p></div>
              <div className="policy-card"><p className="policy-card-title">30-day returns</p><p>Free size exchanges</p></div>
            </div>

            <section id="shipping" className="policy-block" aria-labelledby="shipping-title">
              <h2 id="shipping-title">Shipping</h2>
              <p className="policy-lead">
                {SAME_DAY_CUTOFF} Orders over {formatPrice(FREE_SHIPPING_MIN)} ship free;
                below that, a flat fee applies by area.
              </p>
              <div className="size-table-wrap">
                <table className="size-table ship-table">
                  <caption className="sr-only">Delivery times and fees by area</caption>
                  <thead>
                    <tr><th scope="col">Area</th><th scope="col">Delivery time</th><th scope="col">Fee</th><th scope="col">Over {formatPrice(FREE_SHIPPING_MIN)}</th></tr>
                  </thead>
                  <tbody>
                    {RATES.map((r) => (
                      <tr key={r.area}>
                        <th scope="row">{r.area}</th>
                        <td>{r.time}</td>
                        <td>{formatPrice(r.fee)}</td>
                        <td>Free</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="policy-note">Delivery times may be longer during holidays and sale periods. We don&rsquo;t ship outside Sri Lanka yet.</p>
            </section>

            <section id="returns" className="policy-block" aria-labelledby="returns-title">
              <h2 id="returns-title">Returns</h2>
              <p className="policy-lead">Not quite right? You have 30 days from delivery to return or exchange it.</p>
              <ol className="policy-steps">
                {RETURN_STEPS.map((s, i) => (
                  <li key={s.title} className="policy-step">
                    <span className="policy-num" aria-hidden="true">{i + 1}</span>
                    <p className="policy-card-title">{s.title}</p>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section id="faq" className="policy-block" aria-labelledby="faq-title">
              <h2 id="faq-title">Questions</h2>
              <div className="policy-faq">
                {FAQ.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </Shop>
  );
}
