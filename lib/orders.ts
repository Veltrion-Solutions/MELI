/** Order tracking: shared by the shop, the tracking page and the admin. Safe to import on the client. */

export const ORDER_STEPS = ["placed", "confirmed", "packed", "shipped", "delivered"] as const;
export type OrderStep = (typeof ORDER_STEPS)[number];
export type OrderStatus = OrderStep | "cancelled";
export const ORDER_STATUSES: OrderStatus[] = [...ORDER_STEPS, "cancelled"];

export type Payment = "cod" | "bank";
export const PAYMENT_LABEL: Record<Payment, string> = { cod: "Cash on delivery", bank: "Bank transfer" };

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Order placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Customer-facing description of each step on the tracking page. */
export const STEP_TEXT: Record<OrderStep, string> = {
  placed: "We've received your order.",
  confirmed: "Your order is confirmed and being prepared.",
  packed: "Your pieces are wrapped and ready to go.",
  shipped: "Your parcel is on its way with our courier.",
  delivered: "Your order has been delivered. Enjoy!",
};

export type OrderItem = { id: string; name: string; image: string | null; price: number; size: string; colour: string; qty: number };

/** Row shape of public.orders. */
export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  payment: Payment;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postcode: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  courier: string;
  tracking_number: string;
  status_note: string;
  placed_at: string;
  confirmed_at: string | null;
  packed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  updated_at: string;
};

export const ORDER_COLUMNS =
  "id,number,status,payment,name,email,phone,address,city,district,postcode,notes,items,subtotal,shipping,total,courier,tracking_number,status_note,placed_at,confirmed_at,packed_at,shipped_at,delivered_at,cancelled_at,updated_at";

/** When the order reached a step, or null if it hasn't yet. */
export const stepTime = (o: Order, s: OrderStep) => o[`${s}_at` as const];

export const ORDER_NUMBER_RE = /^MELI-[A-Z0-9]{6,12}$/;

export const formatOrderDate = (iso: string, withTime = true) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
    timeZone: "Asia/Colombo",
  });

export const itemCount = (o: Pick<Order, "items">) => o.items.reduce((n, i) => n + i.qty, 0);
