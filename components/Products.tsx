"use client";

import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { CATEGORIES, PRODUCTS, formatPrice } from "@/lib/products";

export default function Products() {
  const { filter, showCategory, addToBag } = useShop();
  const list = filter ? PRODUCTS.filter((p) => p.category === filter) : PRODUCTS;
  const title = filter ? CATEGORIES.find((c) => c.id === filter)!.label : "New arrivals";

  return (
    <section className="section products" id="shop">
      <div className="wide">
        <div className="section-head center">
          <h2>{title}</h2>
          {filter && <button className="show-all" onClick={() => showCategory(null)}>Show all</button>}
        </div>
        <div className="grid-4 product-grid">
          {list.map((p) => (
            <article key={p.id} className="product">
              <div className="product-img">
                <Photo src={p.image} alt={p.name} sizes="(max-width: 900px) 45vw, 234px" />
                {p.badge && <span className="badge">{p.badge}</span>}
                <button className="add-btn" onClick={addToBag}>Add to bag</button>
              </div>
              <h3>{p.name}</h3>
              <p className="sizes">UK 04 · 06 · 08 · 10 · 12</p>
              <p className="price">{formatPrice(p.price)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
