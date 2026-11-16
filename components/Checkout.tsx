"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Photo from "./Photo";
import { useShop, type CartLine } from "./ShopProvider";
import { COD_MAX, DISTRICTS, FREE_SHIPPING_MIN, SHIPPING_RATES, formatPrice } from "@/lib/products";
import { placeOrder as submitOrder } from "@/app/checkout/actions";

type Step = "details" | "payment" | "done";
type Payment = "cod" | "bank" | "card";

type Details = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postcode: string;
  notes: string;
};
type Errors = Partial<Record<keyof Details, string>>;


const STEPS: { id: Step; label: string }[] = [
  { id: "details", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "done", label: "Confirmed" },
];


// Sri Lankan mobile or landline: 0XXXXXXXXX or +94XXXXXXXXX (spaces and dashes allowed).
const PHONE_RE = /^(?:\+94|0)\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(d: Details): Errors {
  const e: Errors = {};
  if (d.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!EMAIL_RE.test(d.email.trim())) e.email = "Please enter a valid email address.";
  if (!PHONE_RE.test(d.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a Sri Lankan number, e.g. 077 123 4567.";
  if (d.address.trim().length < 5) e.address = "Please enter your street address.";
  if (d.city.trim().length < 2) e.city = "Please enter your town or city.";
  if (!d.district) e.district = "Please choose your district.";
  return e;
}


/** Saved profile details used to pre-fill the form. */
export type CheckoutDefaults = { name: string; email: string; phone: string; address: string; city: string; district: string; postcode: string };

export default function Checkout({ defaults }: { defaults: CheckoutDefaults }) {
  const { cartLines, cartSubtotal, cartCount, bagReady, clearBag } = useShop();
  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState<Details>({
    ...defaults, notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [payment, setPayment] = useState<Payment>("cod");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const router = useRouter();
  const [summaryOpen, setSummaryOpen] = useState(false);

  const rate = useMemo(() => {
    const d = DISTRICTS.find((x) => x.name === details.district);
    return d ? SHIPPING_RATES[d.rate] : null;
  }, [details.district]);
  const freeShipping = cartSubtotal >= FREE_SHIPPING_MIN;
  const shipping = freeShipping ? 0 : rate?.fee ?? null;
  const total = cartSubtotal + (shipping ?? 0);
  const codAllowed = total <= COD_MAX;

  // Fall back from cash on delivery when the order grows past the limit.
  useEffect(() => { if (!codAllowed && payment === "cod") setPayment("bank"); }, [codAllowed, payment]);

  // Each step starts at the top of the page.
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const set = (k: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setDetails((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(details);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`co-${first}`)?.focus(); return; }
    setStep("payment");
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { setAgreeError(true); return; }
    if (payment === "card") return;
    setPlacing(true);
    setPlaceError("");
    let result: Awaited<ReturnType<typeof submitOrder>>;
    try {
      result = await submitOrder({
        items: cartLines.map((l) => ({ id: l.product.id, size: l.size, colour: l.colour, qty: l.qty })),
        ...details,
        payment,
      });
    } catch {
      result = { error: "We couldn't reach the shop. Please check your connection and try again." };
    }
    if (result.error !== undefined) {
      setPlaceError(result.error);
      setPlacing(false);
      return;
    }
    // Saved: show the order's tracking page, then empty the bag.
    setStep("done");
    router.replace(`/orders/${result.number}?placed=1`);
    clearBag();
  };

  // ---------- Order placed: on the way to its tracking page ----------
  if (step === "done") {
    return <div className="container"><p className="co-wait" role="status">Order placed — opening your order…</p></div>;
  }

  // ---------- Loading / empty bag ----------
  if (!bagReady) {
    return <div className="container"><p className="co-wait" role="status">Loading your bag…</p></div>;
  }
  if (cartLines.length === 0) {
    return (
      <div className="container co-empty">
        <p className="eyebrow">Checkout</p>
        <h1>Your bag is empty</h1>
        <p>Add something you love, then come back here to check out.</p>
        <Link href="/new" className="btn btn-solid">Shop new arrivals</Link>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="container">
      <div className="co-head">
        <div className="section-head">
          <p className="eyebrow">Secure checkout</p>
          <h1>Checkout</h1>
        </div>
        <ol className="co-steps" aria-label="Checkout progress">
          {STEPS.map((s, i) => (
            <li key={s.id} className={i < stepIndex ? "done" : i === stepIndex ? "current" : ""} aria-current={i === stepIndex ? "step" : undefined}>
              <span className="co-step-dot" aria-hidden>{i < stepIndex ? "✓" : i + 1}</span>
              <span>{s.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="co-grid">
        {/* ---------- Order summary (collapsible on phones) ---------- */}
        <aside className={`co-summary${summaryOpen ? " open" : ""}`} aria-label="Order summary">
          <button type="button" className="co-summary-toggle" aria-expanded={summaryOpen} onClick={() => setSummaryOpen((o) => !o)}>
            <span>{summaryOpen ? "Hide" : "Show"} order summary ({cartCount})</span>
            <strong>{formatPrice(total)}</strong>
          </button>
          <div className="co-summary-body">
            <p className="co-summary-title">Order summary</p>
            <Lines lines={cartLines} />
            <Totals subtotal={cartSubtotal} shipping={shipping} total={total} />
            {!freeShipping && (
              <p className="co-hint">Add {formatPrice(FREE_SHIPPING_MIN - cartSubtotal)} more for free shipping.</p>
            )}
          </div>
        </aside>

        {/* ---------- Step 1: delivery details ---------- */}
        {step === "details" && (
          <form className="co-panel" onSubmit={submitDetails} noValidate>
            <fieldset className="co-fieldset">
              <legend>Contact</legend>
              <div className="co-row">
                <Field id="name" label="Full name" error={errors.name}>
                  <input id="co-name" autoComplete="name" value={details.name} onChange={set("name")} aria-invalid={!!errors.name || undefined} />
                </Field>
                <Field id="phone" label="Mobile number" hint="For delivery updates" error={errors.phone}>
                  <input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="077 123 4567" value={details.phone} onChange={set("phone")} aria-invalid={!!errors.phone || undefined} />
                </Field>
              </div>
              <Field id="email" label="Email" hint="Your confirmation goes to your account email" error={errors.email}>
                <input id="co-email" type="email" autoComplete="email" value={details.email} onChange={set("email")} aria-invalid={!!errors.email || undefined} />
              </Field>
            </fieldset>

            <fieldset className="co-fieldset">
              <legend>Delivery address</legend>
              <Field id="address" label="Street address" error={errors.address}>
                <input id="co-address" autoComplete="street-address" placeholder="House no., street, apartment" value={details.address} onChange={set("address")} aria-invalid={!!errors.address || undefined} />
              </Field>
              <div className="co-row co-row-3">
                <Field id="city" label="Town / city" error={errors.city}>
                  <input id="co-city" autoComplete="address-level2" value={details.city} onChange={set("city")} aria-invalid={!!errors.city || undefined} />
                </Field>
                <Field id="district" label="District" error={errors.district}>
                  <select id="co-district" value={details.district} onChange={set("district")} aria-invalid={!!errors.district || undefined}>
                    <option value="">Choose…</option>
                    {DISTRICTS.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </Field>
                <Field id="postcode" label="Postcode" hint="Optional">
                  <input id="co-postcode" inputMode="numeric" autoComplete="postal-code" value={details.postcode} onChange={set("postcode")} />
                </Field>
              </div>
              <Field id="notes" label="Delivery notes" hint="Optional — landmarks, gate code, best time to call">
                <textarea id="co-notes" rows={3} value={details.notes} onChange={set("notes")} />
              </Field>
            </fieldset>

            {rate && (
              <div className="co-ship" role="status">
                <div>
                  <p className="co-ship-title">Standard delivery · {rate.area}</p>
                  <p>{rate.time}</p>
                </div>
                <strong>{freeShipping ? "Free" : formatPrice(rate.fee)}</strong>
              </div>
            )}

            <div className="co-actions">
              <Link href="/" className="co-back">← Continue shopping</Link>
              <button type="submit" className="btn btn-solid">Continue to payment</button>
            </div>
          </form>
        )}

        {/* ---------- Step 2: payment & review ---------- */}
        {step === "payment" && (
          <form className="co-panel" onSubmit={placeOrder} noValidate>
            <div className="co-review">
              <div className="co-review-row">
                <span>Contact</span>
                <p>{details.email}<br />{details.phone}</p>
                <button type="button" className="auth-link" onClick={() => setStep("details")}>Change</button>
              </div>
              <div className="co-review-row">
                <span>Deliver to</span>
                <p>{details.name}<br />{details.address}, {details.city}<br />{details.district}{details.postcode && ` ${details.postcode}`}</p>
                <button type="button" className="auth-link" onClick={() => setStep("details")}>Change</button>
              </div>
              <div className="co-review-row">
                <span>Delivery</span>
                <p>Standard · {rate?.time}</p>
                <strong>{shipping === 0 ? "Free" : formatPrice(shipping ?? 0)}</strong>
              </div>
            </div>

            <fieldset className="co-fieldset">
              <legend>Payment method</legend>
              <div className="co-pay" role="radiogroup" aria-label="Payment method">
                <PayOption id="cod" current={payment} onPick={setPayment} disabled={!codAllowed}
                  title="Cash on delivery"
                  text={codAllowed ? "Pay in cash when your order arrives." : `Available for orders up to ${formatPrice(COD_MAX)}.`} />
                <PayOption id="bank" current={payment} onPick={setPayment}
                  title="Bank transfer"
                  text="We'll email our bank details. Your order ships once payment is received." />
                <PayOption id="card" current={payment} onPick={setPayment} disabled
                  title="Credit / debit card" badge="Coming soon"
                  text="Visa, Mastercard and Amex." />
              </div>
            </fieldset>

            <label className={`co-agree${agreeError ? " error" : ""}`}>
              <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setAgreeError(false); }} />
              <span>I agree to the <Link href="/shipping-returns" target="_blank">shipping &amp; returns policy</Link>.</span>
            </label>
            {agreeError && <p className="co-error" role="alert">Please accept the policy to place your order.</p>}
            {placeError && <p className="auth-alert" role="alert">{placeError}</p>}

            <div className="co-actions">
              <button type="button" className="co-back" onClick={() => setStep("details")}>← Back to delivery</button>
              <button type="submit" className="btn btn-solid co-place" disabled={placing}>
                {placing ? "Placing order…" : `Place order · ${formatPrice(total)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="co-field">
      <label htmlFor={`co-${id}`}>{label}{hint && <small>{hint}</small>}</label>
      {children}
      {error && <p className="co-error" role="alert">{error}</p>}
    </div>
  );
}

function PayOption({ id, current, onPick, title, text, badge, disabled }: {
  id: Payment; current: Payment; onPick: (p: Payment) => void; title: string; text: string; badge?: string; disabled?: boolean;
}) {
  return (
    <label className={`co-pay-opt${current === id ? " on" : ""}${disabled ? " off" : ""}`}>
      <input type="radio" name="payment" value={id} checked={current === id} disabled={disabled} onChange={() => onPick(id)} />
      <span className="co-pay-text">
        <span className="co-pay-title">{title}{badge && <em>{badge}</em>}</span>
        <span>{text}</span>
      </span>
    </label>
  );
}

function Lines({ lines }: { lines: CartLine[] }) {
  return (
    <ul className="co-lines">
      {lines.map(({ key, product: p, size, colour, qty }) => (
        <li key={key} className="co-line">
          <div className="co-thumb">
            <Photo src={p.image} alt={p.name} sizes="64px" />
            <span className="co-qty" aria-label={`Quantity ${qty}`}>{qty}</span>
          </div>
          <div>
            <p className="co-line-name">{p.name}</p>
            <p className="co-line-variant">{colour} · Size {size}</p>
          </div>
          <p className="co-line-price">{formatPrice(p.price * qty)}</p>
        </li>
      ))}
    </ul>
  );
}

function Totals({ subtotal, shipping, total }: { subtotal: number; shipping: number | null; total: number }) {
  return (
    <dl className="co-totals">
      <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
      <div><dt>Shipping</dt><dd>{shipping === null ? "Enter district" : shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
      <div className="co-total"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
    </dl>
  );
}

