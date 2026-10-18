import { query } from "@/server/db";
import { clientIp, fail, json, limited } from "@/server/http";
import { friendlyReason } from "@/server/payment-messages";
import { markPaid, paymentsEnabled, paystack } from "@/server/payments";

export const dynamic = "force-dynamic";

/** The customer came back from Paystack: ask Paystack directly, in case the webhook is a moment late. */
export async function GET(req: Request) {
  if (!paymentsEnabled()) return json({ paid: false, state: "pending" });
  if (limited(`verify:${clientIp(req)}`, 200, 10 * 60_000)) return fail("Too many requests", 429);

  const id = (new URL(req.url).searchParams.get("id") ?? "").trim().toUpperCase();
  if (!/^GBH-[A-Z0-9]{4,20}$/.test(id)) return fail("Order not found", 404);

  const [order] = await query("select paid_at, payment_ref from orders where id = $1", [id]);
  if (!order) return fail("Order not found", 404);
  if (order.paid_at) return json({ paid: true, state: "paid" });
  if (!order.payment_ref) return json({ paid: false, state: "pending" });

  try {
    const tx = await paystack<{ status: string; reference: string; amount: number; currency: string; gateway_response?: string }>(
      `/transaction/verify/${encodeURIComponent(String(order.payment_ref))}`
    );
    if (tx.status === "success") {
      await markPaid(id, tx.reference, tx.amount, tx.currency);
      return json({ paid: true, state: "paid" });
    }
    if (["failed", "abandoned", "reversed"].includes(tx.status)) {
      const reason = tx.gateway_response || tx.status;
      // Keep the reason on the order so it can be traced later (once per attempt)
      await query(
        `insert into order_log (order_id, action, note)
         select $1::text, 'Payment not completed', $2::text
          where not exists (select 1 from order_log where order_id = $1::text and note = $2::text)`,
        [id, `${reason} (ref ${tx.reference})`]
      );
      return json({ paid: false, state: "failed", message: friendlyReason(reason) });
    }
  } catch {
    /* still pending */
  }
  return json({ paid: false, state: "pending" });
}
