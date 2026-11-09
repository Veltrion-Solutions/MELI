import Photo from "./Photo";
import { PROMO_IMAGE } from "@/lib/products";

export default function Promo() {
  return (
    <section className="promo">
      <div className="container">
        <a href="#shop" className="promo-img" aria-label="MELI new collection — shop now">
          <Photo src={PROMO_IMAGE} alt="MELI new collection: Soft look. Strong presence." sizes="(max-width: 600px) 90vw, 380px" />
        </a>
      </div>
    </section>
  );
}
