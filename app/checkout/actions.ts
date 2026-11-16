"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseReady } from "@/lib/supabase/config";
import type { Payment } from "@/lib/orders";

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

/** Saves the order through the database's place_order(), which prices and checks everything itself. */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!supabaseReady) return { error: "Orders aren't connected yet. Please try again later." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has ended. Please sign in again to place your order." };

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
  revalidatePath("/account");
  revalidatePath("/orders");
  return { number: data };
}
