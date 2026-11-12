export type Category = "dresses" | "tops";

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];
export type Colour = { name: string; hex: string };

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
  /** All photos for the detail popup; the first is the main shot. */
  gallery: string[];
  description: string;
  /** Fabric, fit and care notes. */
  details: string[];
  /** The first colour is the one shown in the photos. */
  colours: Colour[];
  /** Sizes in stock; the rest show as sold out. */
  inStock: Size[];
};

/** Body measurements in centimetres, shared by the size guide page and the product popup. */
export const SIZE_CHART: { size: Size; uk: string; bust: number[]; waist: number[]; hips: number[] }[] = [
  { size: "XS", uk: "6", bust: [80, 84], waist: [62, 66], hips: [86, 90] },
  { size: "S", uk: "8", bust: [84, 88], waist: [66, 70], hips: [90, 94] },
  { size: "M", uk: "10", bust: [88, 92], waist: [70, 74], hips: [94, 98] },
  { size: "L", uk: "12", bust: [92, 98], waist: [74, 80], hips: [98, 104] },
  { size: "XL", uk: "14", bust: [98, 104], waist: [80, 86], hips: [104, 110] },
];

const img = (id: string, ...views: string[]) => views.map((v) => `/images/${id}/${v}.png`);

export const CATEGORIES: { id: Category; label: string; image?: string }[] = [
  { id: "dresses", label: "Dresses", image: "/images/sierra-midi-dress/front.png" },
  { id: "tops", label: "Tops", image: "/images/elara-front-tie-top/front.png" },
];

export const PRODUCTS: Product[] = [
  {
    id: "sierra-midi-dress", name: "Sierra Midi Dress", price: 9400, category: "dresses", badge: "New",
    image: "/images/sierra-midi-dress/front.png", hoverImage: "/images/sierra-midi-dress/pose.png",
    gallery: img("sierra-midi-dress", "front", "pose", "side", "back"),
    description: "A button-front midi with a lace-trimmed V-neck, fitted empire waist and a soft A-line skirt with a front split.",
    details: ["Lightweight cotton-linen blend", "Cap sleeves, covered buttons", "Midi length with front split", "Machine wash cold, gentle cycle"],
    colours: [{ name: "Butter", hex: "#f1e7b4" }, { name: "Ivory", hex: "#f6f1e7" }, { name: "Sage", hex: "#b9c4a7" }],
    inStock: ["XS", "S", "M", "L"],
  },
  {
    id: "elara-front-tie-top", name: "Elara Front Tie Top", price: 8900, category: "tops", badge: "New",
    image: "/images/elara-front-tie-top/front.png", hoverImage: "/images/elara-front-tie-top/seated.png",
    gallery: img("elara-front-tie-top", "front", "seated", "side", "back", "back-angle"),
    description: "A peplum top with puff sleeves, a lace-edged sweetheart neckline and double front ties.",
    details: ["Soft woven cotton", "Elasticated puff sleeves", "Fitted bodice with peplum hem", "Hand wash cold"],
    colours: [{ name: "Powder blue", hex: "#a9bde3" }, { name: "White", hex: "#fbfbfb" }],
    inStock: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "mia-puff-sleeve-top", name: "Mia Puff Sleeve Top", price: 6500, category: "tops", badge: "Best seller",
    image: "/images/mia-puff-sleeve-top/front.png", hoverImage: "/images/mia-puff-sleeve-top/side.png",
    gallery: img("mia-puff-sleeve-top", "front", "side"),
    description: "A square-neck button-front top with broderie lace trims and gathered puff sleeves.",
    details: ["Crisp cotton poplin", "Covered front buttons", "Lace trim at neck, cuffs and hem", "Machine wash cold"],
    colours: [{ name: "White", hex: "#fbfbfb" }, { name: "Blush", hex: "#f1cfc8" }],
    inStock: ["S", "M", "L"],
  },
  {
    id: "emi-ruffle-sleeve-top", name: "Emi Ruffle Sleeve Top", price: 7200, category: "tops",
    image: "/images/emi-ruffle-sleeve-top/front.png", hoverImage: "/images/emi-ruffle-sleeve-top/side.png",
    gallery: img("emi-ruffle-sleeve-top", "front", "side", "back"),
    description: "A corset-style V-neck top with ruffled flutter sleeves and a pleated peplum.",
    details: ["Structured cotton blend", "Lace-trimmed neckline", "Pleated peplum hem", "Hand wash cold"],
    colours: [{ name: "Rose", hex: "#eeb4b8" }, { name: "Ivory", hex: "#f6f1e7" }],
    inStock: ["XS", "S", "M"],
  },
  {
    id: "emora-shirt-dress", name: "Emora Shirt Dress", price: 11800, category: "dresses", badge: "Best seller",
    image: "/images/emora-shirt-dress/front.png", hoverImage: "/images/emora-shirt-dress/side.png",
    gallery: img("emora-shirt-dress", "front", "side", "back"),
    description: "A crisp mini shirt dress with a pintucked waist, rolled cuffs and a full skirt with side pockets.",
    details: ["Breathable cotton-linen", "Pintucked fitted waist", "Side pockets", "Machine wash cold"],
    colours: [{ name: "White", hex: "#fbfbfb" }, { name: "Sand", hex: "#d9c6a8" }, { name: "Black", hex: "#1c1c1c" }],
    inStock: ["S", "M", "L", "XL"],
  },
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
