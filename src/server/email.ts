import { query } from "@/server/db";
import type { OrderDetails } from "@/types/store";

/**
 * Order emails through Resend (https://resend.com). With no RESEND_API_KEY the
 * functions do nothing, so the shop works the same without email set up.
 * Failures are swallowed on purpose: a mail problem must never lose an order.
 */
const KEY = () => process.env.RESEND_API_KEY;
const FROM = () => process.env.MAIL_FROM || "GBHPL <onboarding@resend.dev>";

const ghs = (n: number) => `GH₵${n.toFixed(2)}`;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function send(to: string, subject: string, html: string) {
  if (!KEY() || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM(), to: [to], subject, html }),
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    /* ignore */
  }
}

function shell(title: string, body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1A3320">
    <div style="background:#1A3320;padding:18px 24px;border-radius:12px 12px 0 0"><b style="color:#D4A017;font-size:18px">Gid's Apple Cider Vinegar</b></div>
    <div style="border:1px solid #e6e0cc;border-top:0;padding:24px;border-radius:0 0 12px 12px">
      <h2 style="margin:0 0 12px">${title}</h2>${body}
      <p style="color:#6b7a6e;font-size:12px;margin-top:24px">Gid's Beverages &amp; Health Products Ltd · Cape Coast, Ghana</p>
    </div></div>`;
}

const lines = (o: OrderDetails) =>
  `<table style="width:100%;border-collapse:collapse;font-size:14px">${o.items
    .map((i) => `<tr><td style="padding:4px 0">${i.quantity} × ${esc(i.size)}</td><td style="text-align:right">${ghs(i.price * i.quantity)}</td></tr>`)
    .join("")}
    <tr><td style="padding:4px 0;color:#6b7a6e">Delivery</td><td style="text-align:right">${ghs(o.deliveryFee)}</td></tr>
    <tr><td style="padding-top:8px;border-top:1px solid #e6e0cc"><b>Total</b></td><td style="text-align:right;padding-top:8px;border-top:1px solid #e6e0cc"><b>${ghs(o.total)}</b></td></tr></table>`;

const site = () => (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

/** Customer confirmation (only if they gave an email) and an alert to the shop. */
export async function notifyOrderPlaced(o: OrderDetails) {
  const track = `${site()}/track?id=${encodeURIComponent(o.id)}`;
  const jobs: Promise<void>[] = [];

  if (o.email) {
    jobs.push(
      send(
        o.email,
        `Your GBHPL order ${o.id}`,
        shell(
          "Thank you for your order",
          `<p>Hi ${esc(o.customerName.split(" ")[0] || "there")}, we have your order.</p>
           <p style="font-size:20px"><b>${o.id}</b></p>${lines(o)}
           <p><a href="${track}" style="background:#D4A017;color:#1A3320;padding:10px 18px;border-radius:99px;text-decoration:none;font-weight:bold">Track your order</a></p>`
        )
      )
    );
  }

  const [settings] = await query<{ trade_email: string }>("select trade_email from settings where id = 1").catch(() => []);
  const shop = process.env.ALERT_EMAIL || settings?.trade_email || "";
  jobs.push(
    send(
      shop,
      `New order ${o.id} · ${ghs(o.total)}`,
      shell(
        "New order",
        `<p><b>${esc(o.customerName || "Customer")}</b> · ${esc(o.phone)}<br>${esc([o.deliveryAddress, o.region].filter(Boolean).join(", "))}</p>
         ${lines(o)}<p>Payment: ${esc(o.paymentMethod)}</p>`
      )
    )
  );
  await Promise.all(jobs);
}

/** Sent once an online payment is confirmed. */
export async function notifyPaid(o: OrderDetails) {
  const [settings] = await query<{ trade_email: string }>("select trade_email from settings where id = 1").catch(() => []);
  const shop = process.env.ALERT_EMAIL || settings?.trade_email || "";
  await Promise.all([
    send(shop, `Paid · ${o.id} · ${ghs(o.total)}`, shell("Payment received", `<p>Order <b>${o.id}</b> was paid online. Pack and deliver it.</p>${lines(o)}`)),
    o.email
      ? send(o.email, `Payment received for ${o.id}`, shell("Payment received", `<p>Thank you! We are packing your order <b>${o.id}</b>.</p>${lines(o)}`))
      : Promise.resolve(),
  ]);
}
