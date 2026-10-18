import { z } from "zod";
import { query } from "@/server/db";
import { clientIp, crossSite, fail, json, limitedDb, readJson } from "@/server/http";
import { friendlyReason } from "@/server/payment-messages";
import { markPaid, paymentsEnabled, paystack } from "@/server/payments";

export const dynamic = "force-dynamic";

const PROVIDER = { momo_mtn: "mtn", momo_telecel: "vod", momo_at: "atl" } as const;

const schema = z.object({
  id: z.string().trim().max(40),
  // Telecel sends a one-time code the customer types in
  otp: z.string().trim().min(3).max(12).optional(),
});

interface ChargeData {
  status: string;
  reference: string;
  display_text?: string;
  amount?: number;
  currency?: string;
}

/**
 * Pay by mobile money without leaving the site: Paystack sends an approval prompt straight
 * to the customer's phone. Returns what the page should show next
 * ("approve" on the phone, "otp" to enter a code, "paid", or "failed").
 */
export async function POST(req: Request) {
  if (!paymentsEnabled()) return fail("Online payment is not switched on yet.", 503);
  if (crossSite(req)) return fail("Blocked", 403);
  if (await limitedDb(`charge:${clientIp(req)}`, 15, 10 * 60_000)) return fail("Too many attempts. Please try again shortly.", 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Order not found", 404);
  const id = parsed.data.id.toUpperCase();

  const [order] = await query("select * from orders where id = $1", [id]);
  if (!order) return fail("Order not found", 404);
  const provider = PROVIDER[order.payment_method as keyof typeof PROVIDER];
  if (!provider) return fail("This order is not a mobile money order.", 409);
  if (order.paid_at) return json({ next: "paid" });
  if (order.status !== "pending_payment") return fail("This order can no longer be paid for.", 409);

  // A payment prompt buzzes a real person's phone: cap how often one order and one number can be prompted
  if (!parsed.data.otp) {
    const phoneKey = String(order.phone).replace(/\D/g, "").slice(-9);
    if (
      (await limitedDb(`charge-order:${id}`, 5, 60 * 60_000)) ||
      (phoneKey && (await limitedDb(`charge-phone:${phoneKey}`, 6, 60 * 60_000)))
    ) {
      return json({ next: "failed", message: "Too many payment attempts. Please wait a while or contact us." });
    }
  }

  try {
    let data: ChargeData;

    if (parsed.data.otp) {
      if (!order.payment_ref) return fail("Start the payment first.", 409);
      data = await paystack<ChargeData>("/charge/submit_otp", { otp: parsed.data.otp, reference: order.payment_ref });
    } else {
      const reference = `${id}-${Date.now().toString(36)}`;
      data = await paystack<ChargeData>("/charge", {
        email: order.email || `${id.toLowerCase()}@orders.gbhpl.com`,
        amount: Math.round(Number(order.total) * 100),
        currency: "GHS",
        reference,
        mobile_money: { phone: String(order.phone).replace(/[^\d+]/g, ""), provider },
        metadata: { orderId: id },
      });
      await query("update orders set payment_ref = $2 where id = $1 and paid_at is null", [id, data.reference || reference]);
    }

    // Which step Paystack asked for, to see why a network prompts or asks for a code (no personal data)
    console.log(`[charge] ${order.payment_method} -> ${data.status} | ${data.display_text ?? ""}`);

    if (data.status === "success") {
      await markPaid(id, data.reference, data.amount ?? Math.round(Number(order.total) * 100), data.currency ?? "GHS");
      return json({ next: "paid" });
    }
    if (data.status === "send_otp") return json({ next: "otp", message: data.display_text ?? "Enter the code sent to your phone." });
    if (data.status === "failed") return json({ next: "failed", message: friendlyReason(data.display_text) });
    // pay_offline / pending / send_pin: the customer approves on their phone
    return json({ next: "approve", message: data.display_text ?? "Approve the payment on your phone." });
  } catch (e) {
    return json({ next: "failed", message: friendlyReason(e instanceof Error ? e.message : "") });
  }
}
