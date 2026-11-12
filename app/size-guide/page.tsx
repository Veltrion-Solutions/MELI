import Shop from "@/components/Shop";
import Header from "@/components/Header";
import SizeGuide from "@/components/SizeGuide";
import Footer from "@/components/Footer";

export const metadata = { title: "Size guide - MELI" };

export default function Page() {
  return (
    <Shop>
      <Header />
      <main>
        <SizeGuide />
      </main>
      <Footer />
    </Shop>
  );
}
