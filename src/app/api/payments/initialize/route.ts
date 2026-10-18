import { z } from "zod";
import { query } from "@/server/db";
import { clientIp, crossSite, fail, json, limitedDb, readJson } from "@/server/http";
import { paymentsEnabled, paystack } from "@/server/payments";

export const dynamic = "force-dynamic";

const schema = z.object({ id: z.string().trim().max(40) });

/** Start an online payment for an order the visitor just placed. Returns the Paystack page to send them to. */
export async function POST(req: Request) {
  if (!paymentsEnabled()) return fail("Online payment is not switched on yet. Pay on delivery or contact us.", 503);
  if (crossSite(req)) return fail("Blocked", 403);
  if (await limitedDb(`pay:${clientIp(req)}`, 15, 10 * 60_000)) return fail("Too many attempts. Please try again shortly.", 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Order not found", 404);
  const id = parsed.data.id.toUpperCase();

  const [order] = await query("select * from orders where id = $1", [id]);
  if (!order) return fail("Order not found", 404);
  if (order.payment_method === "cash") return fail("This order is pay on delivery.", 409);
  if (order.paid_at) return fail("This order is already paid.", 409);
  if (order.status !== "pending_payment") return fail("This order can no longer be paid for.", 409);

  const site = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const reference = `${id}-${Date.now().toString(36)}`;

  try {
    const data = await paystack<{ authorization_url: string }>("/transaction/initialize", {
      email: order.email || `${id.toLowerCase()}@orders.gbhpl.com`,
      amount: Math.round(Number(order.total) * 100),
      currency: "GHS",
      reference,
      channels: ["mobile_money", "card"],
      callback_url: `${site}/track?id=${encodeURIComponent(id)}&paid=1`,
      metadata: { orderId: id },
    });
    await query("update orders set payment_ref = $2 where id = $1 and paid_at is null", [id, reference]);
    return json({ url: data.authorization_url });
  } catch {
    return fail("We could not open the payment page. Please try again.", 502);
  }
}
