"use client";

import { useEffect, useRef, useState } from "react";
import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { FREE_SHIPPING_MIN, formatPrice } from "@/lib/products";

export default function CartDrawer() {
  const { cartOpen, closeCart, cartLines, cartCount, cartSubtotal, setQty, removeFromBag, clearBag } = useShop();
  const panel = useRef<HTMLElement>(null);
  const [note, setNote] = useState(false);

  useEffect(() => {
    if (!cartOpen) { setNote(false); return; }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [cartOpen, closeCart]);

  const remaining = Math.max(0, FREE_SHIPPING_MIN - cartSubtotal);
  const progress = Math.min(100, (cartSubtotal / FREE_SHIPPING_MIN) * 100);

  return (
    <>
      <div className={`cart-overlay${cartOpen ? " open" : ""}`} onClick={closeCart} />
      <aside
        ref={panel}
        tabIndex={-1}
        className={`cart${cartOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        aria-hidden={!cartOpen}
      >
        <div className="cart-head">
          <p className="cart-title">Your bag <span>({cartCount})</span></p>
          <button type="button" className="cart-close" aria-label="Close bag" onClick={closeCart}>×</button>
        </div>

        {cartLines.length === 0 ? (
          <div className="cart-empty">
            <p>Your bag is empty.</p>
            <button type="button" className="btn btn-solid" onClick={closeCart}>Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-ship">
              <p>
                {remaining === 0
                  ? "You've unlocked free shipping."
                  : <>Add <strong>{formatPrice(remaining)}</strong> more for free shipping.</>}
              </p>
              <div className="cart-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="cart-list">
              {cartLines.map(({ product: p, qty }) => (
                <li key={p.id} className="cart-line">
                  <div className="cart-thumb"><Photo src={p.image} alt={p.name} sizes="80px" /></div>
                  <div className="cart-info">
                    <p className="cart-name">{p.name}</p>
                    <p className="cart-price">{formatPrice(p.price)}</p>
                    <div className="cart-qty" role="group" aria-label={`Quantity of ${p.name}`}>
                      <button type="button" aria-label="Decrease quantity" onClick={() => setQty(p.id, qty - 1)}>−</button>
                      <span aria-live="polite">{qty}</span>
                      <button type="button" aria-label="Increase quantity" onClick={() => setQty(p.id, qty + 1)} disabled={qty >= 10}>+</button>
                    </div>
                  </div>
                  <div className="cart-side">
                    <p className="cart-line-total">{formatPrice(p.price * qty)}</p>
                    <button type="button" className="cart-remove" onClick={() => removeFromBag(p.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-foot">
              <div className="cart-row"><span>Subtotal</span><strong>{formatPrice(cartSubtotal)}</strong></div>
              <p className="cart-small">Shipping and taxes are calculated at checkout.</p>
              <button type="button" className="btn btn-solid cart-checkout" onClick={() => setNote(true)}>Checkout</button>
              {note && <p className="cart-note" role="status">Checkout isn&rsquo;t connected yet — this is a demo bag.</p>}
              <button type="button" className="cart-clear" onClick={clearBag}>Clear bag</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
