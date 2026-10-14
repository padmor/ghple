import { randomBytes } from "node:crypto";
import { z } from "zod";
import { query } from "@/server/db";
import { requireManager } from "@/server/auth";
import { fail, json, limited, clientIp, readJson } from "@/server/http";
import { toLogEntry, toOrder, toProduct } from "@/server/mappers";
import { DELIVERY_FEE } from "@/data/pricing";

export const dynamic = "force-dynamic";

// The browser only says WHAT was bought and WHO it is for. Prices, totals, the
// order ID and the time are all decided here on the server.
const schema = z.object({
  customerName: z.string().trim().max(120).default(""),
  phone: z.string().trim().max(40).default(""),
  region: z.string().trim().max(80).default(""),
  deliveryAddress: z.string().trim().max(300).default(""),
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
  if (limited(`order:${clientIp(req)}`, 10, 10 * 60_000)) return fail("Too many orders. Please try again later.", 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Your order is missing something. Please check it and try again.");
  const input = parsed.data;

  // Merge repeated lines, then price everything from the database
  const quantities = new Map<string, number>();
  input.items.forEach((i) => quantities.set(i.id, Math.min(99, (quantities.get(i.id) ?? 0) + i.quantity)));

  const rows = await query("select * from products where id = any($1)", [[...quantities.keys()]]);
  const products = new Map(rows.map((r) => [String(r.id), toProduct(r)]));

  const lines = [];
  for (const [id, quantity] of quantities) {
    const product = products.get(id);
    if (!product) return fail("One of the products is no longer available.", 409);
    if (!product.inStock) return fail(`${product.size} is out of stock.`, 409);
    lines.push({ ...product, quantity });
  }

  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const total = subtotal + DELIVERY_FEE;
  const id = newOrderId();

  // One statement, so the order and its first log line are saved together or not at all
  const [row] = await query(
    `with o as (
       insert into orders (id, customer_name, phone, region, delivery_address, payment_method, items, subtotal, delivery_fee, total)
       values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
       returning *
     ), l as (
       insert into order_log (order_id, action, note)
       select id, 'Order placed', $11 from o
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
      DELIVERY_FEE,
      total,
      `${input.customerName || "Customer"} · ${input.phone || "no phone"} · ${input.paymentMethod}`,
    ]
  );

  await query("insert into events (type, label) values ('order', $1)", [id]);

  const log = (await query("select * from order_log where order_id = $1 order by at, id", [id])).map(toLogEntry);
  // The customer who just placed it gets their own details back in full
  return json(toOrder(row, log), 201);
}

/** Manager: every order, newest first, each with its full activity log. */
export async function GET(req: Request) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  const rows = await query("select * from orders order by created_at desc limit 500");
  const logs = await query("select * from order_log where order_id = any($1) order by at, id", [rows.map((r) => String(r.id))]);

  const byOrder = new Map<string, ReturnType<typeof toLogEntry>[]>();
  logs.forEach((l) => {
    const key = String(l.order_id);
    byOrder.set(key, [...(byOrder.get(key) ?? []), toLogEntry(l)]);
  });
  return json(rows.map((r) => toOrder(r, byOrder.get(String(r.id)) ?? [])));
}
