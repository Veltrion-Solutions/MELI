"use client";

import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { formatPrice } from "@/lib/products";

const FREE_SHIPPING = 12000;

export default function CartDrawer() {
  const { items, subtotal, cartCount, setQty, cartOpen, setCartOpen } = useShop();
  const left = Math.max(0, FREE_SHIPPING - subtotal);
  return (
    <div className={`drawer-root${cartOpen ? " open" : ""}`} aria-hidden={!cartOpen}>
      <div className="drawer-overlay" onClick={() => setCartOpen(false)} />
      <aside className="drawer" role="dialog" aria-label="Shopping bag">
        <div className="drawer-head">
          <h2>Bag ({cartCount})</h2>
          <button aria-label="Close bag" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="ship-note">
          <p>{left ? <>Add <b>{formatPrice(left)}</b> more for free shipping</> : <>You have unlocked <b>free shipping</b></>}</p>
          <div className="ship-bar"><span style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} /></div>
        </div>
        <div className="drawer-body">
          {items.length === 0 && <p className="empty">Your bag is empty.</p>}
          {items.map(({ product: p, qty }) => (
            <div key={p.id} className="line">
              <div className="line-img"><Photo src={p.image} alt={p.name} sizes="80px" /></div>
              <div>
                <p className="line-name">{p.name}</p>
                <p className="line-price">{formatPrice(p.price)}</p>
                <div className="qty">
                  <button aria-label="Decrease" onClick={() => setQty(p.id, qty - 1)}>−</button>
                  <span>{qty}</span>
                  <button aria-label="Increase" onClick={() => setQty(p.id, qty + 1)}>+</button>
                </div>
              </div>
              <button className="line-remove" onClick={() => setQty(p.id, 0)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          <p className="subtotal"><span>Subtotal</span><b>{formatPrice(subtotal)}</b></p>
          <button className="btn btn-solid" disabled={!items.length}>Checkout</button>
        </div>
      </aside>
    </div>
  );
}
