"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_URL, supabaseReady } from "@/lib/supabase/config";
import { getAdmin } from "@/lib/admin";
import { SIZES } from "@/lib/products";

export type SaveState = { ok?: boolean; error?: string; at?: number } | undefined;

const MAX_PRICE = 10_000_000;

export async function adminLogout() {
  if (supabaseReady) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

function parsePrice(v: FormDataEntryValue | null) {
  const n = Number(String(v ?? "").replace(/[,\s]/g, ""));
  return Number.isInteger(n) && n >= 0 && n <= MAX_PRICE ? n : null;
}

/** Shop pages are cached; refresh them after any catalogue change. */
function refreshShop() {
  revalidatePath("/", "layout");
}

export async function savePrice(_: SaveState, form: FormData): Promise<SaveState> {
  const admin = await getAdmin();
  if (!admin) return { error: "Your admin session has ended. Please sign in again." };
  const id = String(form.get("id") ?? "");
  const price = parsePrice(form.get("price"));
  if (price === null) return { error: "Enter a whole number in rupees." };

  const { error, count } = await admin.supabase.from("products").update({ price }, { count: "exact" }).eq("id", id);
  if (error || count === 0) return { error: "Couldn't save. Please try again." };
  refreshShop();
  return { ok: true, at: Date.now() };
}

const MAX_PHOTOS = 10;
const STORAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/product-images/`;

/** Photos may be the bundled /images/... files or uploads in this project's product-images bucket. */
const allowedImage = (u: string) =>
  (/^\/images\/[\w./-]+$/.test(u) && !u.includes("..")) || (u.startsWith(STORAGE_PREFIX) && !u.includes(".."));

type ProductFields = {
  name: string;
  price: number;
  category: "dresses" | "tops";
  badge: "New" | "Best seller" | null;
  description: string;
  details: string[];
  colours: { name: string; hex: string }[];
  in_stock: string[];
  active: boolean;
  sort: number;
  image: string | null;
  hover_image: string | null;
  gallery: string[];
};

/** Validates the shared product form used by both "Add product" and "Edit". */
function parseProductForm(form: FormData): { error: string } | { fields: ProductFields } {
  const name = String(form.get("name") ?? "").trim();
  const price = parsePrice(form.get("price"));
  const category = String(form.get("category") ?? "");
  const badgeRaw = String(form.get("badge") ?? "");
  const description = String(form.get("description") ?? "").trim();
  const sort = Number(form.get("sort") ?? 0);
  const lines = (k: string) => String(form.get(k) ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

  if (!name || name.length > 120) return { error: "Name is required (up to 120 characters)." };
  if (price === null) return { error: "Price must be a whole number in rupees." };
  if (category !== "dresses" && category !== "tops") return { error: "Choose a category." };
  if (badgeRaw && badgeRaw !== "New" && badgeRaw !== "Best seller") return { error: "Unknown badge." };
  if (!Number.isInteger(sort)) return { error: "Sort order must be a whole number." };

  const colours: { name: string; hex: string }[] = [];
  for (const l of lines("colours")) {
    const m = l.match(/^(.+?)\s+(#[0-9a-fA-F]{6})$/);
    if (!m) return { error: `Colour "${l}" should look like: Butter #f1e7b4` };
    colours.push({ name: m[1].trim(), hex: m[2].toLowerCase() });
  }
  if (colours.length === 0) return { error: "Add at least one colour." };

  const inStock = form.getAll("in_stock").map(String).filter((s) => (SIZES as readonly string[]).includes(s));

  const images = form.getAll("images").map(String).filter(Boolean);
  if (images.length > MAX_PHOTOS) return { error: `Up to ${MAX_PHOTOS} photos per product.` };
  if (images.some((u) => !allowedImage(u))) return { error: "One of the photos has an unexpected address. Please re-upload it." };

  return {
    fields: {
      name,
      price,
      category,
      badge: (badgeRaw || null) as ProductFields["badge"],
      description,
      details: lines("details"),
      colours,
      in_stock: inStock,
      active: form.get("active") === "on",
      sort,
      // First photo is the main shot, second shows on hover; all of them make up the gallery.
      image: images[0] ?? null,
      hover_image: images[1] ?? null,
      gallery: images,
    },
  };
}

export async function saveProduct(_: SaveState, form: FormData): Promise<SaveState> {
  const admin = await getAdmin();
  if (!admin) return { error: "Your admin session has ended. Please sign in again." };

  const parsed = parseProductForm(form);
  if ("error" in parsed) return parsed;

  const id = String(form.get("id") ?? "");
  const { error, count } = await admin.supabase.from("products").update(parsed.fields, { count: "exact" }).eq("id", id);
  if (error || count === 0) return { error: "Couldn't save. Please try again." };
  refreshShop();
  return { ok: true, at: Date.now() };
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "product";

export async function createProduct(_: SaveState, form: FormData): Promise<SaveState> {
  const admin = await getAdmin();
  if (!admin) return { error: "Your admin session has ended. Please sign in again." };

  const parsed = parseProductForm(form);
  if ("error" in parsed) return parsed;
  if (!parsed.fields.image) return { error: "Add at least one photo." };

  // Product id doubles as its URL-safe key; add -2, -3… if the name is already taken.
  const base = slugify(parsed.fields.name);
  const { data: taken } = await admin.supabase.from("products").select("id").like("id", `${base}%`);
  const used = new Set((taken ?? []).map((r) => r.id as string));
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;

  // New products go to the end unless a sort order was typed in.
  let sort = parsed.fields.sort;
  if (!String(form.get("sort") ?? "").trim()) {
    const { data: last } = await admin.supabase.from("products").select("sort").order("sort", { ascending: false }).limit(1);
    sort = ((last?.[0]?.sort as number | undefined) ?? 0) + 1;
  }

  const { error } = await admin.supabase.from("products").insert({ id, ...parsed.fields, sort });
  if (error) return { error: `Couldn't add the product: ${error.message}` };
  refreshShop();
  redirect(`/admin/products/${id}?created=1`);
}
