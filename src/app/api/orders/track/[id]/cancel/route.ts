import { z } from "zod";
import { query } from "@/server/db";
import { clientIp, crossSite, fail, json, limitedDb, readJson } from "@/server/http";
import { publicOrder, toLogEntry, toOrder } from "@/server/mappers";

export const dynamic = "force-dynamic";

const schema = z.object({ phone: z.string().trim().min(1).max(40) });

/**
 * A customer cancels their own order. Having the order ID is not enough: they must
 * also give the phone number used at checkout. Only orders that are still
 * "Received" and unpaid can be cancelled this way; after that, contact the shop.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  if (crossSite(req)) return fail("Blocked", 403);
  if (await limitedDb(`cancel:${clientIp(req)}`, 8, 10 * 60_000)) return fail("Too many attempts. Please try again later.", 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Enter the phone number you used when ordering.");

  const id = decodeURIComponent(params.id).trim().toUpperCase();
  if (!/^GBH-[A-Z0-9]{4,20}$/.test(id)) return fail("Order not found", 404);
  // Stops anyone guessing the phone number for one order
  if (await limitedDb(`cancel-order:${id}`, 6, 60 * 60_000)) return fail("Too many attempts for this order. Please contact us.", 429);

  const [current] = await query("select * from orders where id = $1", [id]);
  if (!current) return fail("Order not found", 404);

  const digits = (s: string) => s.replace(/\D/g, "");
  const given = digits(parsed.data.phone);
  const stored = digits(String(current.phone ?? ""));
  // Compare the last 9 digits so 0244… and +233244… both match
  if (!stored || given.slice(-9) !== stored.slice(-9)) return fail("That phone number doesn't match this order.", 403);

  if (current.status === "cancelled") return fail("This order is already cancelled.", 409);
  if (current.paid_at) return fail("This order has been paid for. Please message us and we'll sort it out.", 409);
  if (current.status !== "pending_payment") return fail("This order is already being prepared. Please message us to change it.", 409);

  const [row] = await query(
    `with o as (
       update orders set status = 'cancelled' where id = $1 and status = 'pending_payment' and paid_at is null returning *
     ), l as (
       insert into order_log (order_id, action, note) select id, 'Cancelled by customer', 'Phone verified' from o
     )
     select * from o`,
    [id]
  );
  if (!row) return fail("This order can no longer be cancelled.", 409);

  const log = (await query("select * from order_log where order_id = $1 order by at, id", [id])).map(toLogEntry);
  return json(publicOrder(toOrder(row, log)));
}
