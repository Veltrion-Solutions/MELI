"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
import { ORDER_COLUMNS, type Order, type Payment } from "@/lib/orders";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/order-email";
import { siteUrl } from "@/lib/site";
import { LIMITS, allowed, clientIp } from "@/lib/rate-limit";

export type PlaceOrderInput = {
  items: { id: string; size: string; colour: string; qty: number }[];
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postcode: string;
  notes: string;
  payment: Payment;
};

export type PlaceOrderResult = { number: string; error?: undefined } | { error: string; number?: undefined };

const BAD_INPUT: PlaceOrderResult = { error: "Something in your order looks wrong. Please refresh the page and try again." };

/**
 * Server actions can be called with any payload, not just what our form sends,
 * so the shape and size of everything is checked before it goes anywhere.
 */
function clean(input: unknown): PlaceOrderInput | null {
  if (!input || typeof input !== "object") return null;
  const i = input as Record<string, unknown>;
  const text = (v: unknown, max: number) => (typeof v === "string" && v.length <= max ? v.trim() : null);
  if (!Array.isArray(i.items) || i.items.length === 0 || i.items.length > 50) return null;
  const items: PlaceOrderInput["items"] = [];
  for (const raw of i.items) {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const id = text(r.id, 80), size = text(r.size, 10), colour = text(r.colour, 60);
    if (!id || !size || !colour || !Number.isInteger(r.qty) || (r.qty as number) < 1 || (r.qty as number) > 10) return null;
    items.push({ id, size, colour, qty: r.qty as number });
  }
  const fields = {
    name: text(i.name, 120), email: text(i.email, 254), phone: text(i.phone, 20), address: text(i.address, 300),
    city: text(i.city, 80), district: text(i.district, 40), postcode: text(i.postcode, 12), notes: text(i.notes, 500),
  };
  if (Object.values(fields).some((v) => v === null)) return null;
  if (i.payment !== "cod" && i.payment !== "bank") return null;
  return { items, ...(fields as Record<keyof typeof fields, string>), payment: i.payment };
}

/** Saves the order through the database's place_order(), which prices and checks everything itself. */
export async function placeOrder(raw: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!supabaseReady) return { error: "Orders aren't connected yet. Please try again later." };
  const input = clean(raw);
  if (!input) return BAD_INPUT;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has ended. Please sign in again to place your order." };
  // Stops scripted order floods (each order sends an email and ties up stock).
  if (!(await allowed([`order:user:${user.id}`, LIMITS.orderUser], [`order:ip:${await clientIp()}`, LIMITS.orderIp]))) {
    return { error: "You've placed a lot of orders in a short time. Please wait a while, or contact us if you need help." };
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_items: input.items.map(({ id, size, colour, qty }) => ({ id, size, colour, qty })),
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_address: input.address,
    p_city: input.city,
    p_district: input.district,
    p_postcode: input.postcode,
    p_notes: input.notes,
    p_payment: input.payment,
  });
  if (error || typeof data !== "string") {
    // P0001 = a message raised by place_order() itself, written for customers.
    if (error?.code === "P0001") return { error: error.message };
    console.error("[checkout] place_order failed:", error);
    return { error: "We couldn't place your order. Please try again in a moment." };
  }
  const number = data;

  // Confirmation email with the saved order (prices as charged). Sent after the response,
  // so the customer isn't kept waiting; a failed send never affects the order.
  const { data: row } = await supabase.from("orders").select(ORDER_COLUMNS).eq("number", number).maybeSingle();
  // Sent to the account's own (verified) email, not the address typed at checkout, so the
  // shop can't be used to send emails to strangers.
  const to = user.email;
  if (row && to) {
    const order = row as unknown as Order;
    const site = await siteUrl();
    after(async () => {
      const mail = orderConfirmationEmail(order, site);
      const sent = await sendEmail({ to, ...mail });
      if (sent) console.info(`[checkout] Confirmation email sent for ${order.number}`);
    });
  }

  revalidatePath("/account", "layout");
  return { number };
}
