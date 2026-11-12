import { ShopProvider } from "@/components/ShopProvider";
import Header from "@/components/Header";
import SizeGuide from "@/components/SizeGuide";
import Footer from "@/components/Footer";

export const metadata = { title: "Size guide - MELI" };

export default function Page() {
  return (
    <ShopProvider>
      <Header />
      <main>
        <SizeGuide />
      </main>
      <Footer />
    </ShopProvider>
  );
}
