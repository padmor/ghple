import { z } from "zod";
import { query } from "@/server/db";
import { requireManager } from "@/server/auth";
import { fail, json, readJson } from "@/server/http";
import { toLogEntry, toOrder } from "@/server/mappers";
import type { OrderRefund } from "@/types/store";

export const dynamic = "force-dynamic";

// Only the status and the refund can change. The customer, items and totals are
// facts about what was bought and can never be edited afterwards.
const schema = z.object({
  changes: z
    .object({
      status: z.enum(["pending_payment", "confirmed", "out_for_delivery", "delivered"]).optional(),
      refund: z
        .object({
          status: z.enum(["requested", "refunded"]),
          reason: z.string().trim().min(1).max(200),
          amount: z.number().min(0),
        })
        .optional(),
    })
    .strict(),
  entry: z.object({ action: z.string().trim().min(1).max(120), note: z.string().max(500).nullish() }),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("That change is not allowed.");
  const { changes, entry } = parsed.data;

  const id = decodeURIComponent(params.id);
  const [current] = await query("select * from orders where id = $1", [id]);
  if (!current) return fail("Order not found", 404);

  const order = toOrder(current);
  let refund: OrderRefund | null = order.refund ?? null;

  if (changes.refund) {
    const next = changes.refund;
    if (next.amount > order.total) return fail("The refund cannot be more than the order total.");
    if (order.refund?.status === "refunded") return fail("This order has already been refunded.", 409);
    const now = new Date().toISOString();
    refund = {
      status: next.status,
      reason: next.reason,
      amount: next.amount,
      requestedAt: order.refund?.requestedAt ?? now,
      refundedAt: next.status === "refunded" ? now : undefined,
    };
  }

  // The manager's name goes into every log line so each action can be traced to a person
  const note = [entry.note, `by ${auth.name || auth.email}`].filter(Boolean).join(" · ");

  const [row] = await query(
    `with o as (
       update orders set status = coalesce($2, status), refund = coalesce($3::jsonb, refund)
       where id = $1 returning *
     ), l as (
       insert into order_log (order_id, action, note) select id, $4, $5 from o
     )
     select * from o`,
    [id, changes.status ?? null, refund ? JSON.stringify(refund) : null, entry.action, note]
  );

  const log = (await query("select * from order_log where order_id = $1 order by at, id", [id])).map(toLogEntry);
  return json(toOrder(row, log));
}
