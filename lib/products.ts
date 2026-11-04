export type Category = "dresses" | "tops" | "skirts" | "pants";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  badge?: "New" | "Best seller";
  /** Path under /public, e.g. "/images/marisol-maxi.jpg". Placeholder is shown until set. */
  image?: string;
};

export const CATEGORIES: { id: Category; label: string; image?: string }[] = [
  { id: "dresses", label: "Dresses", image: "/images/aurelie-wrap-midi.jpg" },
  { id: "tops", label: "Tops", image: "/images/vesper-lace-up-shirt.jpg" },
  { id: "skirts", label: "Skirts", image: "/images/cerise-gingham-midi.jpg" },
  { id: "pants", label: "Pants", image: "/images/sand-tailored-wide-leg.jpg" },
];

export const PRODUCTS: Product[] = [
  { id: "aurelie-wrap-midi", name: "Aurelie Wrap Midi", price: 9400, category: "dresses", badge: "New", image: "/images/aurelie-wrap-midi.jpg" },
  { id: "vesper-lace-up-shirt", name: "Vesper Lace-Up Shirt", price: 8900, category: "tops", badge: "New", image: "/images/vesper-lace-up-shirt.jpg" },
  { id: "mei-tie-neck-top", name: "Mei Tie-Neck Top", price: 6500, category: "tops", badge: "Best seller", image: "/images/mei-tie-neck-top.jpg" },
  { id: "cerise-gingham-midi", name: "Cerise Gingham Midi", price: 8400, category: "skirts", image: "/images/cerise-gingham-midi.jpg" },
  { id: "azure-tiered-maxi", name: "Azure Tiered Maxi", price: 9400, category: "dresses", badge: "Best seller", image: "/images/azure-tiered-maxi.jpg" },
  { id: "sand-tailored-wide-leg", name: "Sand Tailored Wide-Leg", price: 10200, category: "pants", image: "/images/sand-tailored-wide-leg.jpg" },
  { id: "marisol-maxi", name: "Marisol Maxi", price: 11800, category: "dresses", image: "/images/marisol-maxi.jpg" },
  { id: "linden-belted-wide-leg", name: "Linden Belted Wide-Leg", price: 10800, category: "pants", image: "/images/linden-belted-wide-leg.jpg" },
];

export const FEATURED_ID = "marisol-maxi";

export const REVIEWS = [
  { quote: "The wrap midi fits like it was made for me. I've worn it to two weddings already.", name: "Tharushi", city: "Colombo" },
  { quote: "Beautiful fabrics and the delivery to Kandy came in two days. Lovely packaging too.", name: "Nadeesha", city: "Kandy" },
  { quote: "Finally pants that are tailored but comfortable for the heat. Ordering another colour!", name: "Amaya", city: "Galle" },
];

export const formatPrice = (n: number) => `Rs ${n.toLocaleString("en-US")}`;
