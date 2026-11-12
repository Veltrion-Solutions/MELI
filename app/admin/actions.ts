"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
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

export async function saveProduct(_: SaveState, form: FormData): Promise<SaveState> {
  const admin = await getAdmin();
  if (!admin) return { error: "Your admin session has ended. Please sign in again." };

  const id = String(form.get("id") ?? "");
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

  const { error, count } = await admin.supabase
    .from("products")
    .update({
      name,
      price,
      category,
      badge: badgeRaw || null,
      description,
      details: lines("details"),
      colours,
      in_stock: inStock,
      active: form.get("active") === "on",
      sort,
    }, { count: "exact" })
    .eq("id", id);
  if (error || count === 0) return { error: "Couldn't save. Please try again." };
  refreshShop();
  return { ok: true, at: Date.now() };
}
