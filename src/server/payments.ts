import { query } from "@/server/db";
import { toOrder } from "@/server/mappers";
import { waitUntil } from "@vercel/functions";
import { notifyPaid } from "@/server/email";
import type { OrderDetails } from "@/types/store";

/** Paystack (https://paystack.com) takes MoMo and cards in Ghana. Without a key, online payment is simply off. */
export const paystackKey = () => process.env.PAYSTACK_SECRET_KEY || "";
export const paymentsEnabled = () => Boolean(paystackKey());

export async function paystack<T = Record<string, unknown>>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`https://api.paystack.co${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${paystackKey()}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null;
  if (!res.ok || !data?.status) throw new Error(data?.message || `Paystack error ${res.status}`);
  return data.data as T;
}

/**
 * Record a confirmed payment. Safe to call many times (the webhook and the return
 * page both do): only the first call changes anything. The amount must match the
 * order exactly, so a short or wrong payment is never accepted.
 */
export async function markPaid(orderId: string, reference: string, paidPesewas: number, currency: string) {
  const [current] = await query("select * from orders where id = $1", [orderId]);
  if (!current) return null;

  // Already paid. A different reference means the customer paid twice: flag it for a refund.
  if (current.paid_at) {
    if (current.payment_ref && current.payment_ref !== reference) {
      await query(
        `insert into order_log (order_id, action, note)
         select $1::text, 'Duplicate payment', $2::text
          where not exists (select 1 from order_log where order_id = $1::text and action = 'Duplicate payment' and note like '%' || $3::text || '%')`,
        [orderId, `Paid twice. Refund needed. Ref ${reference}`, reference]
      );
    }
    return null;
  }

  if (currency !== "GHS" || paidPesewas !== Math.round(Number(current.total) * 100)) {
    await query("insert into order_log (order_id, action, note) values ($1, 'Payment mismatch', $2)", [
      orderId,
      `Received ${currency} ${(paidPesewas / 100).toFixed(2)}, expected GHS ${Number(current.total).toFixed(2)}. Ref ${reference}`,
    ]);
    return null;
  }

  const cancelled = current.status === "cancelled";
  const [row] = await query(
    `with o as (
       update orders
          set paid_at = now(), payment_ref = $2,
              status = case when status = 'pending_payment' then 'confirmed' else status end
        where id = $1 and paid_at is null
        returning *
     ), l as (
       insert into order_log (order_id, action, note)
       select id, case when $3::boolean then 'Paid after cancellation' else 'Payment received' end,
              case when $3::boolean then 'Refund needed. Ref ' || $2 else 'Paystack ref ' || $2 end from o
     )
     select * from o`,
    [orderId, reference, cancelled]
  );
  if (!row) return null;

  const order: OrderDetails = toOrder(row);
  waitUntil(notifyPaid(order).catch(() => undefined));
  return order;
}

/**
 * Safety net for the manager list: any recent mobile money order that has a payment
 * attempt but is not marked paid is checked with Paystack. This catches approvals
 * whose webhook was missed, without the manager doing anything.
 */
export async function reconcilePending() {
  if (!paymentsEnabled()) return;
  const rows = await query(
    `select id, payment_ref from orders
      where paid_at is null and status = 'pending_payment' and payment_ref is not null
        and created_at > now() - interval '2 days'
      order by created_at desc limit 5`
  );
  await Promise.all(
    rows.map(async (r) => {
      try {
        const tx = await paystack<{ status: string; reference: string; amount: number; currency: string }>(
          `/transaction/verify/${encodeURIComponent(String(r.payment_ref))}`
        );
        if (tx.status === "success") await markPaid(String(r.id), tx.reference, tx.amount, tx.currency);
      } catch {
        /* try again on the next refresh */
      }
    })
  );
}
