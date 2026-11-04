import { ShopProvider } from "@/components/ShopProvider";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import SplitBanner from "@/components/SplitBanner";
import Categories from "@/components/Categories";
import { NewArrivals, BestSellers } from "@/components/Products";
import ParallaxBanner from "@/components/ParallaxBanner";
import Ticker from "@/components/Ticker";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import MobileDock from "@/components/MobileDock";

export default function Home() {
  return (
    <ShopProvider>
      <Header />
      <main id="top">
        <HeroSlider
          slides={[
            { image: "/images/hero.jpg", title: "Soft days, well dressed", desc: "Easy dresses and fabrics that feel as good as they look.", category: "dresses" },
            { image: "/images/mei-tie-neck-top.jpg", title: "The Summer Edit", desc: "Tailored-feeling tops for warm afternoons.", category: "tops" },
            { image: "/images/cerise-gingham-midi.jpg", title: "Sweet gingham", desc: "Breezy skirts made for the way you actually live.", category: "skirts" },
          ]}
        />
        <Categories />
        <NewArrivals />
        <SplitBanner
          items={[
            { title: "SKIRTS", desc: "Sweet gingham and breezy tiers.", image: "/images/cerise-gingham-midi.jpg", href: "#shop", category: "skirts" },
            { title: "PANTS", desc: "Tailored but comfortable for the heat.", image: "/images/sand-tailored-wide-leg.jpg", href: "#shop", category: "pants" },
          ]}
        />
        <BestSellers />
        <ParallaxBanner image="/images/story.jpg" title="Clothes that feel like you on your best day." href="#shop" />
        <Ticker />
        <Reviews />
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <MobileDock />
    </ShopProvider>
  );
}
