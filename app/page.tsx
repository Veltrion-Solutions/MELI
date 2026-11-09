import { ShopProvider } from "@/components/ShopProvider";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Products from "@/components/Products";
import Promo from "@/components/Promo";
import Story from "@/components/Story";
import Reviews from "@/components/Reviews";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <ShopProvider>
      <Header />
      <main>
        <Hero />
        <Categories />
        <Products />
        <Promo />
        <Story />
        <Reviews />
        <Newsletter />
      </main>
      <Footer />
    </ShopProvider>
  );
}
