export type Category = "dresses" | "tops";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  badge?: "New" | "Best seller";
  /** Path under /public, e.g. "/images/marisol-maxi.jpg". Placeholder is shown until set. */
  image?: string;
  /** Secondary view shown on hover. */
  hoverImage?: string;
};

export const CATEGORIES: { id: Category; label: string; image?: string }[] = [
  { id: "dresses", label: "Dresses", image: "/images/sierra-midi-dress/front.png" },
  { id: "tops", label: "Tops", image: "/images/elara-front-tie-top/front.png" },
];

export const PRODUCTS: Product[] = [
  { id: "sierra-midi-dress", name: "Sierra Midi Dress", price: 9400, category: "dresses", badge: "New", image: "/images/sierra-midi-dress/front.png", hoverImage: "/images/sierra-midi-dress/pose.png" },
  { id: "elara-front-tie-top", name: "Elara Front Tie Top", price: 8900, category: "tops", badge: "New", image: "/images/elara-front-tie-top/front.png", hoverImage: "/images/elara-front-tie-top/seated.png" },
  { id: "mia-puff-sleeve-top", name: "Mia Puff Sleeve Top", price: 6500, category: "tops", badge: "Best seller", image: "/images/mia-puff-sleeve-top/front.png", hoverImage: "/images/mia-puff-sleeve-top/side.png" },
  { id: "emi-ruffle-sleeve-top", name: "Emi Ruffle Sleeve Top", price: 7200, category: "tops", image: "/images/emi-ruffle-sleeve-top/front.png", hoverImage: "/images/emi-ruffle-sleeve-top/side.png" },
  { id: "emora-shirt-dress", name: "Emora Shirt Dress", price: 11800, category: "dresses", badge: "Best seller", image: "/images/emora-shirt-dress/front.png", hoverImage: "/images/emora-shirt-dress/side.png" },
];

/** Order value (Rs) above which shipping is free — matches the announcement bar. */
export const FREE_SHIPPING_MIN = 12000;

export const FEATURED_ID = "sierra-midi-dress";
export const PROMO_IMAGE = "/images/meli-new-collection-promo.png";
export const STORY_IMAGE = "/images/emora-shirt-dress/front.png";

export const REVIEWS = [
  { quote: "The wrap midi fits like it was made for me. I've worn it to two weddings already.", name: "Tharushi", city: "Colombo" },
  { quote: "Beautiful fabrics and the delivery to Kandy came in two days. Lovely packaging too.", name: "Nadeesha", city: "Kandy" },
  { quote: "Finally pants that are tailored but comfortable for the heat. Ordering another colour!", name: "Amaya", city: "Galle" },
];

export const formatPrice = (n: number) => `Rs ${n.toLocaleString("en-US")}`;
