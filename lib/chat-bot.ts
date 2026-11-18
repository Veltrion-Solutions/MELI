/**
 * MELI's shopping assistant. Runs entirely in the browser with simple keyword rules — no AI
 * service and no API calls. Every answer is built from the same product list, size chart,
 * delivery fees and policies the site shows, so it stays correct when those change.
 */
import {
  COD_MAX, DISTRICTS, FREE_SHIPPING_MIN, SHIPPING_RATES, SIZE_CHART, SIZES,
  formatPrice, type Product, type Size,
} from "./products";
import { FAQ, RETURN_STEPS, SAME_DAY_CUTOFF } from "./policies";

export type BotLink = { label: string; href: string };
export type BotReply = {
  text: string;
  /** Product ids shown as small cards the customer can open. */
  products?: string[];
  links?: BotLink[];
  /** Suggested follow-up questions. */
  chips?: string[];
};

export const WELCOME: BotReply = {
  text: "Hi! I'm the MELI assistant. I can help you find a style, pick your size, or answer questions about delivery, payment and returns.",
  chips: ["Find my size", "Delivery fees", "Show new arrivals", "Returns policy"],
};

const DEFAULT_CHIPS = ["Find my size", "Delivery fees", "Cash on delivery", "Track my order"];

// ---------- helpers ----------

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9.\s-]/g, " ").replace(/\s+/g, " ").trim();
const has = (t: string, ...words: string[]) => words.some((w) => new RegExp(`\\b${w}`).test(t));
const ids = (list: Product[]) => list.map((p) => p.id);
const listNames = (list: Product[]) => list.map((p) => `${p.name} (${formatPrice(p.price)})`).join(", ");

function stockLine(p: Product): string {
  return p.inStock.length ? `In stock in ${p.inStock.join(", ")}.` : "It's currently sold out in every size.";
}

/** Products whose name (or first name, e.g. "Sierra") appears in the message. */
function mentionedProducts(t: string, products: Product[]): Product[] {
  return products.filter((p) => {
    const name = norm(p.name);
    return t.includes(name) || t.split(" ").includes(name.split(" ")[0]);
  });
}

// ---------- size advice ----------

type Measures = { bust?: number; waist?: number; hips?: number };

function parseMeasures(t: string): Measures {
  const cm = /\bcm\b|centimet/.test(t);
  const conv = (n: number) => (cm || n > 60 ? n / 2.54 : n); // numbers over 60 are almost certainly cm
  const m: Measures = {};
  // "bust 34, waist 30" vs "34 bust, 30 waist": whichever comes first in the message sets the order,
  // so a number is never paired with the label next to it on the wrong side.
  const firstNum = t.search(/\d{2,3}/);
  const firstLabel = t.search(/\b(bust|chest|breast|waist|hip)/);
  const numberFirst = firstNum !== -1 && firstLabel !== -1 && firstNum < firstLabel;
  const grab = (key: keyof Measures, words: string) => {
    const hit = numberFirst
      ? t.match(new RegExp(`(\\d{2,3}(?:\\.\\d)?)\\s*(?:in|inch|inches|cm)?\\s*(?:${words})`))
      : t.match(new RegExp(`(?:${words})\\D{0,12}?(\\d{2,3}(?:\\.\\d)?)`));
    if (hit) m[key] = conv(parseFloat(hit[1]));
  };
  grab("bust", "bust|chest|breast");
  grab("waist", "waist");
  grab("hips", "hips?|hip");
  // "34-30-38" or "34 30 38" with no labels = bust, waist, hips
  if (!m.bust && !m.waist && !m.hips) {
    const trio = t.match(/\b(\d{2,3})\s*[-/,x ]\s*(\d{2,3})\s*[-/,x ]\s*(\d{2,3})\b/);
    if (trio) [m.bust, m.waist, m.hips] = [trio[1], trio[2], trio[3]].map((n) => conv(parseFloat(n)));
  }
  return m;
}

function recommendSize(m: Measures): Size | "too-big" {
  let idx = 0;
  for (const key of ["bust", "waist", "hips"] as const) {
    const v = m[key];
    if (v === undefined) continue;
    const i = SIZE_CHART.findIndex((r) => r[key] >= v - 0.25);
    if (i === -1) return "too-big";
    idx = Math.max(idx, i);
  }
  return SIZE_CHART[idx].size;
}

function sizeReply(t: string, products: Product[]): BotReply {
  const m = parseMeasures(t);
  const given = Object.entries(m).filter(([, v]) => v !== undefined);
  if (!given.length) {
    return {
      text: "Happy to help you find your size! Tell me your bust, waist and hip measurements in inches, for example: bust 34, waist 30, hips 38.",
      links: [{ label: "Size guide", href: "/size-guide" }],
    };
  }
  const size = recommendSize(m);
  const fmt = given.map(([k, v]) => `${k} ${Math.round(v! * 10) / 10}"`).join(", ");
  if (size === "too-big") {
    const big = SIZE_CHART[SIZE_CHART.length - 1];
    return {
      text: `With ${fmt}, you're above our largest size (${big.size}: bust ${big.bust}", waist ${big.waist}", hips ${big.hips}"). Our relaxed styles like the Emora Shirt Dress may still work — please check the size guide for each piece.`,
      links: [{ label: "Size guide", href: "/size-guide" }],
    };
  }
  const row = SIZE_CHART.find((r) => r.size === size)!;
  const note = given.length < 3 ? " Share all three measurements for a more accurate match." : "";
  const mentioned = mentionedProducts(t, products);
  const stock = mentioned.length
    ? " " + mentioned.map((p) => `${p.name}: ${p.inStock.includes(size) ? `${size} is in stock` : `${size} is sold out right now`}.`).join(" ")
    : "";
  return {
    text: `Based on ${fmt}, we'd suggest size ${size} (bust ${row.bust}", waist ${row.waist}", hips ${row.hips}"). If you're between sizes, go one size up for a relaxed fit.${note}${stock}`,
    products: mentioned.length ? ids(mentioned) : ids(products.filter((p) => p.inStock.includes(size))).slice(0, 3),
    links: [{ label: "Size guide", href: "/size-guide" }],
  };
}

// ---------- delivery ----------

function deliveryReply(t: string): BotReply {
  const district = DISTRICTS.find((d) => t.includes(d.name.toLowerCase()));
  const free = `Orders over ${formatPrice(FREE_SHIPPING_MIN)} ship free.`;
  if (district) {
    const r = SHIPPING_RATES[district.rate];
    return {
      text: `Delivery to ${district.name} takes ${r.time} and costs ${formatPrice(r.fee)}. ${free} ${SAME_DAY_CUTOFF}`,
      links: [{ label: "Shipping & returns", href: "/shipping-returns#shipping" }],
    };
  }
  return {
    text: `We deliver island-wide in Sri Lanka:\n${SHIPPING_RATES.map((r) => `- ${r.area}: ${r.time}, ${formatPrice(r.fee)}`).join("\n")}\n${free} ${SAME_DAY_CUTOFF} Tell me your district for an exact answer.`,
    links: [{ label: "Shipping & returns", href: "/shipping-returns#shipping" }],
  };
}

// ---------- main ----------

/** Works out a reply to one customer message. */
export function botReply(input: string, products: Product[]): BotReply {
  const t = norm(input);
  if (!t) return { text: "Ask me anything about MELI — sizes, styles, delivery or returns.", chips: DEFAULT_CHIPS };

  const named = mentionedProducts(t, products);
  const sizeWords = has(t, "size", "fit", "measure", "bust", "waist", "hip", "chest", "small", "large", "tight", "loose");
  const hasNumbers = /\d{2}/.test(t);

  // Thanks / goodbye
  if (/^(thanks|thank you|thx|ty|ok|okay|great|cool|bye|goodbye)\b/.test(t) && t.split(" ").length <= 4) {
    return { text: "You're welcome! Let me know if there's anything else I can help with. 💛" };
  }

  // Greeting
  if (/^(hi|hello|hey|hiya|good (morning|afternoon|evening)|ayubowan)\b/.test(t) && t.split(" ").length <= 4) {
    return WELCOME;
  }

  // Order tracking
  if (has(t, "track", "where is my", "order status", "my order", "delivered yet", "not received", "havent received")) {
    return {
      text: "You can follow your order any time from My orders when you're signed in. We also send an SMS and email with a tracking link as soon as your order leaves our studio.",
      links: [{ label: "My orders", href: "/orders" }],
    };
  }

  // Damaged / wrong item
  if (has(t, "damage", "broken", "torn", "wrong item", "wrong size sent", "defect", "faulty", "stain")) {
    return { text: FAQ[3].a, links: [{ label: "Returns", href: "/shipping-returns#returns" }] };
  }

  // Exchanges
  if (has(t, "exchange", "swap", "change size", "different size")) {
    return { text: FAQ[0].a, links: [{ label: "Returns & exchanges", href: "/shipping-returns#returns" }] };
  }

  // Returns / refunds
  if (has(t, "return", "refund", "money back", "send back")) {
    if (has(t, "cant", "cannot", "not allowed", "final sale", "which items")) return { text: FAQ[2].a };
    return {
      text: `You have 30 days from delivery to return an item:\n${RETURN_STEPS.map((s, i) => `${i + 1}. ${s.text}`).join("\n")}`,
      links: [{ label: "Returns policy", href: "/shipping-returns#returns" }],
      chips: ["Can I exchange for a different size?", "What can't be returned?"],
    };
  }

  // Payment
  if (has(t, "cash on delivery", "cod", "pay", "payment", "card", "visa", "master", "bank", "transfer", "koko", "installment")) {
    return {
      text: `Cash on delivery is available island-wide for orders up to ${formatPrice(COD_MAX)}. You choose how to pay at checkout.`,
      links: [{ label: "Go to checkout", href: "/checkout" }],
    };
  }

  // Delivery / shipping
  if (has(t, "deliver", "shipping", "ship", "courier", "how long", "how many days", "arrive", "postage", "free shipping")
    || DISTRICTS.some((d) => t.includes(d.name.toLowerCase()))) {
    if (has(t, "international", "abroad", "overseas", "outside sri lanka", "uk", "usa", "australia", "dubai", "india")) {
      return { text: "We only deliver within Sri Lanka for now — international shipping is coming later." };
    }
    return deliveryReply(t);
  }

  // "Is the Sierra available in M?"
  // A bare "s" or "m" is too ambiguous, so those two only count after "size" or "in".
  const sizeAsked = [...SIZES].reverse().find((sz) => {
    const s = sz.toLowerCase();
    return new RegExp(`\\b(size|in an?|in) ${s}\\b`).test(t) || (s.length > 1 && new RegExp(`\\b${s}\\b`).test(t));
  });
  if (named.length && sizeAsked && !hasNumbers) {
    return {
      text: named.map((p) => `The ${p.name} is ${p.inStock.includes(sizeAsked) ? `in stock in ${sizeAsked}` : `sold out in ${sizeAsked} right now`}. ${stockLine(p)}`).join(" "),
      products: ids(named),
    };
  }

  // Size help
  if (sizeWords || (hasNumbers && /\d{2}\s*[-/, ]\s*\d{2}\s*[-/, ]\s*\d{2}/.test(t))) {
    if (has(t, "chart", "guide", "table") && !hasNumbers) {
      return {
        text: `Our sizes run from ${SIZES[0]} to ${SIZES[SIZES.length - 1]}:\n${SIZE_CHART.map((r) => `- ${r.size}: bust ${r.bust}", waist ${r.waist}", hips ${r.hips}"`).join("\n")}`,
        links: [{ label: "Size guide", href: "/size-guide" }],
        chips: ["Find my size"],
      };
    }
    return sizeReply(t, products);
  }

  // Account / login
  if (has(t, "login", "log in", "sign in", "sign up", "register", "account", "password", "forgot")) {
    return {
      text: has(t, "password", "forgot")
        ? "You can reset your password from the sign-in page using \"Forgot password\". If you're signed in, you can change it from your account."
        : "You can sign in or create an account from the sign-in page. Your account keeps your bag, address and orders in one place.",
      links: [{ label: "Sign in", href: "/login" }, { label: "My account", href: "/account" }],
    };
  }

  // A specific product
  if (named.length) {
    const p = named[0];
    const colourAsked = has(t, "colou?r");
    return {
      text: colourAsked
        ? `The ${p.name} comes in ${p.colours.map((c) => c.name).join(", ")}.`
        : `The ${p.name} is ${formatPrice(p.price)}. ${p.description} Colours: ${p.colours.map((c) => c.name).join(", ")}. ${stockLine(p)}`,
      products: ids(named),
      chips: ["Find my size", "Delivery fees"],
    };
  }

  // Price questions
  const under = t.match(/(?:under|below|less than|within|budget)\s*(?:rs\.?|lkr)?\s*([\d,.]+)\s*(k)?/);
  if (under) {
    const max = parseFloat(under[1].replace(/,/g, "")) * (under[2] ? 1000 : 1);
    const cat = has(t, "dress") ? "dresses" : has(t, "top", "blouse") ? "tops" : null;
    const hits = products.filter((p) => p.price <= max && (!cat || p.category === cat)).sort((a, b) => a.price - b.price);
    return hits.length
      ? { text: `Here's what we have under ${formatPrice(max)}: ${listNames(hits)}.`, products: ids(hits) }
      : { text: `Nothing under ${formatPrice(max)} right now — our pieces start at ${formatPrice(Math.min(...products.map((p) => p.price)))}.` };
  }
  if (has(t, "cheap", "lowest price", "affordable", "least expensive")) {
    const sorted = [...products].sort((a, b) => a.price - b.price).slice(0, 3);
    return { text: `Our most affordable pieces: ${listNames(sorted)}.`, products: ids(sorted) };
  }
  if (has(t, "price", "cost", "how much", "expensive")) {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    return {
      text: `Our pieces range from ${formatPrice(sorted[0].price)} to ${formatPrice(sorted[sorted.length - 1].price)}. Ask about any style by name and I'll give you the details.`,
      chips: ["Show dresses", "Show tops"],
    };
  }

  // Colours
  const colourHits = products.filter((p) => p.colours.some((c) => t.includes(c.name.toLowerCase())));
  if (colourHits.length) {
    const colour = colourHits[0].colours.find((c) => t.includes(c.name.toLowerCase()))!.name;
    return { text: `These come in ${colour.toLowerCase()}: ${listNames(colourHits)}.`, products: ids(colourHits) };
  }

  // Categories and collections
  if (has(t, "new", "latest", "arrival")) {
    const hits = products.filter((p) => p.badge === "New");
    return { text: hits.length ? `Just in: ${listNames(hits)}.` : "Have a look at our newest pieces.", products: ids(hits), links: [{ label: "New in", href: "/new" }] };
  }
  if (has(t, "best", "popular", "recommend", "suggest", "favourite", "favorite", "trending")) {
    const hits = products.filter((p) => p.badge === "Best seller");
    const list = hits.length ? hits : products.slice(0, 3);
    return { text: `Customer favourites: ${listNames(list)}.`, products: ids(list) };
  }
  if (has(t, "dress", "frock", "midi", "maxi", "mini")) {
    const hits = products.filter((p) => p.category === "dresses");
    return { text: `Our dresses: ${listNames(hits)}.`, products: ids(hits), links: [{ label: "Shop dresses", href: "/dresses" }] };
  }
  if (has(t, "top", "blouse", "shirt")) {
    const hits = products.filter((p) => p.category === "tops");
    return { text: `Our tops: ${listNames(hits)}.`, products: ids(hits), links: [{ label: "Shop tops", href: "/tops" }] };
  }
  if (has(t, "skirt", "pant", "trouser", "jean", "shorts", "saree", "kurta", "mens", "kids")) {
    return {
      text: "We don't stock that yet — right now MELI has dresses and tops. Follow us on social media to hear about new collections first.",
      chips: ["Show dresses", "Show tops"],
    };
  }

  // Fabric and care
  if (has(t, "fabric", "material", "cotton", "linen", "wash", "care", "iron")) {
    return {
      text: `Our pieces are made in breathable natural fabrics:\n${products.map((p) => `- ${p.name}: ${p.details[0]}; ${p.details[p.details.length - 1]}`).join("\n")}`,
    };
  }

  // Stock
  if (has(t, "stock", "available", "sold out")) {
    return { text: products.map((p) => `- ${p.name}: ${p.inStock.join(", ") || "sold out"}`).join("\n"), chips: ["Find my size"] };
  }

  // People / contact
  if (has(t, "human", "person", "agent", "contact", "call", "phone", "email", "whatsapp", "talk to", "speak")) {
    return {
      text: "I'm an automated assistant, so I can't connect you to a person here. To reach the MELI team, message us on Instagram or Facebook (links at the bottom of the page) — we'll get back to you as soon as we can.",
    };
  }

  // Location / studio
  if (has(t, "shop location", "store", "studio", "visit", "where are you", "physical")) {
    return { text: "MELI is an online store designed in Sri Lanka. Our studio is in Colombo, where you can also drop off returns." };
  }

  return {
    text: "Sorry, I'm not sure about that one. I can help with sizes, styles, prices, delivery, payment and returns — try one of these:",
    chips: DEFAULT_CHIPS,
  };
}
