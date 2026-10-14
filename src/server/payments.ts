import { query } from "@/server/db";
import { toLogEntry, toOrder } from "@/server/mappers";
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
  if (!current || current.paid_at) return null;

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

  const log = (await query("select * from order_log where order_id = $1 order by at, id", [orderId])).map(toLogEntry);
  const order: OrderDetails = toOrder(row, log);
  await notifyPaid(order);
  return order;
}
