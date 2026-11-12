import Shop from "./Shop";
import Header from "./Header";
import Footer from "./Footer";
import Collection, { type CollectionKey } from "./Collection";

export default function CollectionPage({ name }: { name: CollectionKey }) {
  return (
    <Shop>
      <Header />
      <main>
        <Collection name={name} />
      </main>
      <Footer />
    </Shop>
  );
}
