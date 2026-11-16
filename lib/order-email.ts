import "server-only";
import { formatPrice } from "./products";
import { BANK_DETAILS, PAYMENT_LABEL, formatOrderDate, itemCount, type Order } from "./orders";

/** Escapes text for HTML; every customer-entered value goes through this. */
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const absolute = (site: string, src: string | null) =>
  !src ? "" : /^https?:\/\//.test(src) ? src : `${site}${src.startsWith("/") ? "" : "/"}${src}`;

const FONT = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;";
const INK = "#181818";
const MUTED = "#6b6b6b";
const LINE = "#ececec";

/** Order confirmation email: subject, HTML (table layout + inline styles for email clients) and plain text. */
export function orderConfirmationEmail(o: Order, site: string) {
  const first = o.name.trim().split(/\s+/)[0] ?? "";
  const track = `${site}/orders/${encodeURIComponent(o.number)}`;
  const placed = formatOrderDate(o.placed_at);
  const count = itemCount(o);
  const bank = o.payment === "bank";
  const subject = `Your MELI order ${o.number} is confirmed`;

  const items = o.items.map((it) => {
    const img = absolute(site, it.image);
    return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid ${LINE};width:72px;vertical-align:top;">
          ${img ? `<img src="${esc(img)}" width="60" height="80" alt="" style="display:block;width:60px;height:80px;object-fit:cover;border-radius:6px;background:#f1f1f1;">` : ""}
        </td>
        <td style="padding:14px 12px;border-bottom:1px solid ${LINE};vertical-align:top;${FONT}font-size:14px;color:${INK};">
          ${esc(it.name)}<br>
          <span style="font-size:12px;color:${MUTED};">${esc(it.colour)} · Size ${esc(it.size)} · Qty ${it.qty}</span>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid ${LINE};vertical-align:top;text-align:right;white-space:nowrap;${FONT}font-size:14px;color:${INK};">
          ${formatPrice(it.price * it.qty)}
        </td>
      </tr>`;
  }).join("");

  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:4px 0;${FONT}font-size:${strong ? 16 : 14}px;color:${strong ? INK : MUTED};${strong ? "font-weight:600;" : ""}">${label}</td>
      <td style="padding:4px 0;text-align:right;${FONT}font-size:${strong ? 16 : 14}px;color:${INK};${strong ? "font-weight:600;" : ""}">${value}</td>
    </tr>`;

  const address = [o.name, `${o.address}, ${o.city}`, `${o.district}${o.postcode ? ` ${o.postcode}` : ""}`, o.phone]
    .map(esc).join("<br>");

  const bankBox = bank ? `
    <tr><td style="padding:0 32px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border-radius:10px;">
        <tr><td style="padding:18px 20px;${FONT}font-size:14px;color:${INK};line-height:1.6;">
          <strong>Complete your bank transfer</strong><br>
          ${BANK_DETAILS.map(([k, v]) => `<span style="color:${MUTED};">${esc(k)}:</span> ${esc(v)}`).join("<br>")}<br>
          <span style="color:${MUTED};">Amount:</span> ${formatPrice(o.total)}<br>
          <span style="color:${MUTED};">Reference:</span> <strong>${esc(o.number)}</strong><br>
          <span style="font-size:13px;color:${MUTED};">Please use your order number as the reference. We'll confirm your order once the payment clears.</span>
        </td></tr>
      </table>
    </td></tr>` : "";

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f3f3;">
  <div style="display:none;max-height:0;overflow:hidden;">Thanks for your order! ${count} ${count === 1 ? "item" : "items"} · ${formatPrice(o.total)} · Track it any time.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f3;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;">
        <tr><td style="padding:28px 32px 8px;text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:2px;color:${INK};">MELI</div>
          <div style="${FONT}font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${MUTED};">Wear MELI</div>
        </td></tr>

        <tr><td style="padding:20px 32px 8px;text-align:center;${FONT}">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">Order ${esc(o.number)}</div>
          <h1 style="margin:10px 0 8px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:26px;color:${INK};">Thank you${first ? `, ${esc(first)}` : ""}!</h1>
          <p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED};">We've received your order and will let you know as it moves along.<br>Placed ${esc(placed)}.</p>
        </td></tr>

        <tr><td align="center" style="padding:20px 32px 28px;">
          <a href="${esc(track)}" style="display:inline-block;padding:13px 30px;border-radius:999px;background:${INK};color:#ffffff;text-decoration:none;${FONT}font-size:14px;font-weight:500;">Track your order</a>
        </td></tr>

        ${bankBox}

        <tr><td style="padding:0 32px;">
          <div style="${FONT}font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${INK};padding-bottom:4px;border-bottom:1px solid ${LINE};">Your items (${count})</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            ${row("Subtotal", formatPrice(o.subtotal))}
            ${row("Shipping", o.shipping === 0 ? "Free" : formatPrice(o.shipping))}
            ${row("Total", formatPrice(o.total), true)}
          </table>
        </td></tr>

        <tr><td style="padding:28px 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="vertical-align:top;padding-right:12px;${FONT}font-size:14px;line-height:1.6;color:${INK};">
                <div style="font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Delivery address</div>
                ${address}
                ${o.notes ? `<br><span style="color:${MUTED};font-size:13px;">Note: ${esc(o.notes)}</span>` : ""}
              </td>
              <td width="50%" style="vertical-align:top;padding-left:12px;${FONT}font-size:14px;line-height:1.6;color:${INK};">
                <div style="font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Payment</div>
                ${PAYMENT_LABEL[o.payment]}<br>
                <span style="color:${MUTED};font-size:13px;">${bank ? "Awaiting your transfer." : `Please have ${formatPrice(o.total)} ready on delivery.`}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};">
            <tr><td style="padding-top:20px;${FONT}font-size:14px;line-height:1.7;color:${INK};">
              <div style="font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">What happens next</div>
              1. We confirm your order${bank ? " once your transfer arrives" : ""}.<br>
              2. We pack your pieces and hand them to our courier.<br>
              3. You get your tracking number on your <a href="${esc(track)}" style="color:${INK};">order page</a>.<br>
              4. Delivered to your door.
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:20px 32px 28px;background:#fafafa;border-radius:0 0 12px 12px;text-align:center;${FONT}font-size:12px;line-height:1.7;color:${MUTED};">
          Questions? Just reply to this email with your order number.<br>
          <a href="${esc(site)}/shipping-returns" style="color:${MUTED};">Shipping &amp; returns</a> · <a href="${esc(site)}/account/orders" style="color:${MUTED};">My orders</a><br>
          © MELI · Designed in Sri Lanka
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Thank you${first ? `, ${first}` : ""}! Your MELI order ${o.number} is confirmed.`,
    `Placed ${placed}`,
    "",
    `Track your order: ${track}`,
    "",
    "ITEMS",
    ...o.items.map((it) => `- ${it.name} (${it.colour}, size ${it.size}) x${it.qty}: ${formatPrice(it.price * it.qty)}`),
    "",
    `Subtotal: ${formatPrice(o.subtotal)}`,
    `Shipping: ${o.shipping === 0 ? "Free" : formatPrice(o.shipping)}`,
    `Total: ${formatPrice(o.total)}`,
    "",
    "DELIVERY ADDRESS",
    o.name, `${o.address}, ${o.city}`, `${o.district}${o.postcode ? ` ${o.postcode}` : ""}`, o.phone,
    ...(o.notes ? [`Note: ${o.notes}`] : []),
    "",
    `PAYMENT: ${PAYMENT_LABEL[o.payment]}`,
    ...(bank
      ? [...BANK_DETAILS.map(([k, v]) => `${k}: ${v}`), `Amount: ${formatPrice(o.total)}`, `Reference: ${o.number}`]
      : [`Please have ${formatPrice(o.total)} ready on delivery.`]),
    "",
    "Questions? Reply to this email with your order number.",
    `${site}/shipping-returns`,
  ].join("\n");

  return { subject, html, text };
}
