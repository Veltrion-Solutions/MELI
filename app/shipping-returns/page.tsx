import Shop from "@/components/Shop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FREE_SHIPPING_MIN, formatPrice } from "@/lib/products";

export const metadata = { title: "Shipping & returns - MELI" };

// Placeholder rates and timings — replace with MELI's real policy.
const RATES = [
  { area: "Colombo & suburbs", time: "1–2 working days", fee: 350 },
  { area: "Western Province", time: "2–3 working days", fee: 400 },
  { area: "Rest of the island", time: "3–5 working days", fee: 450 },
];

const RETURN_STEPS = [
  { title: "Start a return", text: "Contact us within 30 days of delivery with your order number and the items you'd like to return." },
  { title: "Pack it up", text: "Send items unworn and unwashed, with tags attached, in their original packaging." },
  { title: "We collect or you drop off", text: "We'll arrange a courier pickup, or you can drop the parcel at our Colombo studio." },
  { title: "Get your refund", text: "Once we've checked your return, we refund to your original payment method within 5–7 working days." },
];

const FAQ = [
  { q: "Can I exchange for a different size?", a: "Yes. Ask for an exchange when you start your return and we'll send the new size as soon as your return is on its way, subject to stock. Size exchanges are free." },
  { q: "Do you offer cash on delivery?", a: "Yes, cash on delivery is available island-wide for orders up to Rs 30,000." },
  { q: "What can't be returned?", a: "Sale items marked final sale, and items that have been worn, washed, altered or have had their tags removed." },
  { q: "My item arrived damaged or wrong.", a: "We're sorry! Let us know within 48 hours of delivery with a photo, and we'll replace it or refund you in full, including shipping." },
  { q: "How do I track my order?", a: "You'll receive an SMS and email with a tracking link as soon as your order leaves our studio." },
];

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
                Orders placed before 2 pm on a working day are packed and sent the same day. Orders over {formatPrice(FREE_SHIPPING_MIN)} ship free;
                below that, a flat fee applies by area.
              </p>
              <div className="size-table-wrap">
                <table className="size-table">
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
