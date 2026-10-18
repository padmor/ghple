import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query } from "@/server/db";
import { requireManager } from "@/server/auth";
import { fail, json, readJson } from "@/server/http";
import { toSettings } from "@/server/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  const [row] = await query("select * from settings where id = 1");
  return row ? json(toSettings(row)) : fail("Not set up", 404);
}

const schema = z
  .object({
    tradeEmail: z.string().trim().max(200),
    whatsappNumber: z.string().trim().max(40),
    phone: z.string().trim().max(40),
    phone2: z.string().trim().max(40),
    deliveryFee: z.number().min(0).max(10000),
    address: z.string().trim().max(300),
  })
  .partial()
  .strict();

/** Manager: change the store's contact details. */
export async function PATCH(req: Request) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Check the details and try again.");
  const c = parsed.data;

  const [row] = await query(
    `update settings set
       trade_email     = coalesce($1, trade_email),
       whatsapp_number = coalesce($2, whatsapp_number),
       phone           = coalesce($3, phone),
       address         = coalesce($4, address),
       phone2          = coalesce($5, phone2),
       delivery_fee    = coalesce($6, delivery_fee)
     where id = 1 returning *`,
    [c.tradeEmail ?? null, c.whatsappNumber ?? null, c.phone ?? null, c.address ?? null, c.phone2 ?? null, c.deliveryFee ?? null]
  );
  revalidatePath("/", "layout");
  return json(toSettings(row));
}
