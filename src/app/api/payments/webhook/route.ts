import { createHmac, timingSafeEqual } from "node:crypto";
import { noContent, fail } from "@/server/http";
import { markPaid, paystackKey } from "@/server/payments";

export const dynamic = "force-dynamic";

/** Paystack tells us a payment succeeded. The signature proves it really came from Paystack. */
export async function POST(req: Request) {
  const key = paystackKey();
  if (!key) return fail("Not configured", 503);

  const raw = await req.text();
  const given = req.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", key).update(raw).digest("hex");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return fail("Bad signature", 401);

  try {
    const event = JSON.parse(raw) as {
      event: string;
      data: { reference: string; amount: number; currency: string; status: string; metadata?: { orderId?: string } };
    };
    const orderId = event.data?.metadata?.orderId;
    if (event.event === "charge.success" && event.data.status === "success" && orderId) {
      await markPaid(orderId, event.data.reference, event.data.amount, event.data.currency);
    }
  } catch {
    /* acknowledge anyway so Paystack does not retry a malformed event forever */
  }
  return noContent();
}
