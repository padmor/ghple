import { randomBytes } from "node:crypto";
import { z } from "zod";
import { query } from "@/server/db";
import { requireManager } from "@/server/auth";
import { fail, json, limitedDb, crossSite, clientIp, readJson } from "@/server/http";
import { toLogEntry, toOrder, toProduct } from "@/server/mappers";
import { waitUntil } from "@vercel/functions";
import { notifyOrderPlaced } from "@/server/email";
import { reconcilePending } from "@/server/payments";

export const dynamic = "force-dynamic";

// The browser only says WHAT was bought and WHO it is for. Prices, totals, the
// order ID and the time are all decided here on the server.
const schema = z.object({
  customerName: z.string().trim().max(120).default(""),
  phone: z.string().trim().max(40).default(""),
  email: z.string().trim().max(200).default(""),
  region: z.string().trim().max(80).default(""),
  deliveryAddress: z.string().trim().max(300).default(""),
  fulfillment: z.enum(["delivery", "pickup"]).default("delivery"),
  location: z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), label: z.string().max(300).optional() })
    .optional(),
  paymentMethod: z.enum(["momo_mtn", "momo_telecel", "momo_at", "cash"]),
  items: z
    .array(z.object({ id: z.string().max(80), quantity: z.number().int().min(1).max(99) }))
    .min(1)
    .max(30),
});

// Readable, hard-to-guess ID, e.g. GBH-7K2QX9MD (no 0/O/1/I to avoid mix-ups)
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function newOrderId() {
  const bytes = randomBytes(8);
  return "GBH-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export async function POST(req: Request) {
  if (crossSite(req)) return fail("Blocked", 403);
  if (await limitedDb(`order:${clientIp(req)}`, 10, 10 * 60_000)) return fail("Too many orders. Please try again later.", 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Your order is missing something. Please check it and try again.");
  const input = parsed.data;

  // One phone number can't be flooded with orders (and payment prompts) from many places
  const phoneKey = input.phone.replace(/\D/g, "").slice(-9);
  if (phoneKey && (await limitedDb(`order-phone:${phoneKey}`, 6, 60 * 60_000))) {
    return fail("Too many orders for this phone number. Please try again later or contact us.", 429);
  }

  // Merge repeated lines, then price everything from the database
  const quantities = new Map<string, number>();
  input.items.forEach((i) => quantities.set(i.id, Math.min(99, (quantities.get(i.id) ?? 0) + i.quantity)));

  // The delivery fee is a manager setting, read here so the browser can never choose it.
  // Both reads go out together instead of one after the other.
  const [rows, feeRows] = await Promise.all([
    query("select * from products where id = any($1)", [[...quantities.keys()]]),
    query<{ delivery_fee: string }>("select delivery_fee from settings where id = 1"),
  ]);
  const products = new Map(rows.map((r) => [String(r.id), toProduct(r)]));

  const lines = [];
  for (const [id, quantity] of quantities) {
    const product = products.get(id);
    if (!product) return fail("One of the products is no longer available.", 409);
    if (!product.inStock) return fail(`${product.size} is out of stock.`, 409);
    lines.push({ ...product, quantity });
  }

  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const fee = input.fulfillment === "pickup" ? 0 : Number(feeRows[0]?.delivery_fee ?? 20);
  const total = subtotal + fee;
  const id = newOrderId();

  // One statement, so the order and its first log line are saved together or not at all
  const [row] = await query(
    `with o as (
       insert into orders (id, customer_name, phone, email, fulfillment, location, region, delivery_address, payment_method, items, subtotal, delivery_fee, total)
       values ($1, $2, $3, $12, $13, $14::jsonb, $4, $5, $6, $7::jsonb, $8, $9, $10)
       returning *
     ), l as (
       insert into order_log (order_id, action, note)
       select id, 'Order placed', $11 from o
     ), e as (
       insert into events (type, label) select 'order', id from o
     )
     select * from o`,
    [
      id,
      input.customerName,
      input.phone,
      input.region,
      input.deliveryAddress,
      input.paymentMethod,
      JSON.stringify(lines),
      subtotal,
      fee,
      total,
      `${input.customerName || "Customer"} · ${input.phone || "no phone"} · ${input.paymentMethod}`,
      input.email.includes("@") ? input.email : "",
      input.fulfillment,
      input.location ? JSON.stringify(input.location) : null,
    ]
  );

  // The first log line was written in the same statement, at the same instant as the order
  const order = toOrder(row, [
    toLogEntry({ at: row.created_at, action: "Order placed", note: `${input.customerName || "Customer"} · ${input.phone || "no phone"} · ${input.paymentMethod}` }),
  ]);
  // Emails go out after the customer already has their answer
  waitUntil(notifyOrderPlaced(order).catch(() => undefined));
  // The customer who just placed it gets their own details back in full
  return json(order, 201);
}

/** Manager: every order, newest first, each with its full activity log. */
export async function GET(req: Request) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  // Check unpaid MoMo orders with Paystack in the background; the next refresh shows any result
  waitUntil(reconcilePending().catch(() => undefined));

  // Orders and their logs in one round trip
  const rows = await query(
    `select o.*,
            coalesce((select json_agg(json_build_object('at', l.at, 'action', l.action, 'note', l.note) order by l.at, l.id)
                        from order_log l where l.order_id = o.id), '[]'::json) as log_json
       from orders o order by o.created_at desc limit 500`
  );
  return json(rows.map((r) => toOrder(r, (r.log_json as { at: string; action: string; note: string | null }[]).map((l) => toLogEntry(l)))));
}
