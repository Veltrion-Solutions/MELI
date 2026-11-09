import Photo from "./Photo";
import { STORY_IMAGE } from "@/lib/products";

export default function Story() {
  return (
    <section className="story" id="story">
      <div className="story-bg"><Photo src={STORY_IMAGE} alt="" sizes="100vw" /></div>
      <div className="story-copy">
        <p className="eyebrow">Our story</p>
        <h2>Clothes that feel like you on your best day.</h2>
        <p>Designed in Sri Lanka in breathable linens, cottons and soft crepes — made for warm afternoons and easy evenings.</p>
      </div>
    </section>
  );
}
