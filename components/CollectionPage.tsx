import { ShopProvider } from "./ShopProvider";
import Header from "./Header";
import Footer from "./Footer";
import Collection, { type CollectionKey } from "./Collection";

export default function CollectionPage({ name }: { name: CollectionKey }) {
  return (
    <ShopProvider>
      <Header />
      <main>
        <Collection name={name} />
      </main>
      <Footer />
    </ShopProvider>
  );
}
