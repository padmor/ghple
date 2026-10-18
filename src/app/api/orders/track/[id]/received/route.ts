import { z } from "zod";
import { waitUntil } from "@vercel/functions";
import { query } from "@/server/db";
import { clientIp, crossSite, fail, json, limitedDb, readJson } from "@/server/http";
import { publicOrder, toLogEntry, toOrder } from "@/server/mappers";
import { notifyReceived } from "@/server/email";

export const dynamic = "force-dynamic";

const schema = z.object({ phone: z.string().trim().min(1).max(40) });

/**
 * The customer confirms their order arrived. As with cancelling, the order ID alone is
 * not enough: they also give the phone number used at checkout.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  if (crossSite(req)) return fail("Blocked", 403);
  if (await limitedDb(`received:${clientIp(req)}`, 8, 10 * 60_000)) return fail("Too many attempts. Please try again later.", 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Enter the phone number you used when ordering.");

  const id = decodeURIComponent(params.id).trim().toUpperCase();
  if (!/^GBH-[A-Z0-9]{4,20}$/.test(id)) return fail("Order not found", 404);
  // Stops anyone guessing the phone number for one order
  if (await limitedDb(`received-order:${id}`, 6, 60 * 60_000)) return fail("Too many attempts for this order. Please contact us.", 429);

  const [current] = await query("select * from orders where id = $1", [id]);
  if (!current) return fail("Order not found", 404);

  const digits = (s: string) => s.replace(/\D/g, "");
  const given = digits(parsed.data.phone);
  const stored = digits(String(current.phone ?? ""));
  if (!stored || given.slice(-9) !== stored.slice(-9)) return fail("That phone number doesn't match this order.", 403);

  if (current.status === "delivered") return fail("This order is already marked as delivered.", 409);
  if (current.status !== "out_for_delivery") return fail("This order has not been sent out yet.", 409);

  const [row] = await query(
    `with o as (
       update orders set status = 'delivered' where id = $1 and status = 'out_for_delivery' returning *
     ), l as (
       insert into order_log (order_id, action, note) select id, 'Delivered', 'Confirmed received by the customer' from o
     )
     select * from o`,
    [id]
  );
  if (!row) return fail("This order can no longer be updated.", 409);

  const log = (await query("select * from order_log where order_id = $1 order by at, id", [id])).map(toLogEntry);
  const order = toOrder(row, log);
  waitUntil(notifyReceived(order).catch(() => undefined));
  return json(publicOrder(order));
}
