import { z } from "zod";
import { query } from "@/server/db";
import { requireManager } from "@/server/auth";
import { clientIp, fail, json, limited, noContent, readJson } from "@/server/http";

const schema = z.object({
  type: z.enum(["visit", "add_to_cart", "checkout", "order"]),
  label: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  if (limited(`event:${clientIp(req)}`, 120, 60_000)) return fail("Too many requests", 429);
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Invalid event");
  // Orders are recorded by the order endpoint itself, never by the browser
  if (parsed.data.type === "order") return noContent();
  await query("insert into events (type, label) values ($1, $2)", [parsed.data.type, parsed.data.label ?? null]);
  return noContent();
}

export const dynamic = "force-dynamic";

/** Manager: the latest storefront activity, oldest first. */
export async function GET(req: Request) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  const rows = await query("select * from (select * from events order by at desc limit 500) recent order by at");
  return json(
    rows.map((r) => ({
      id: String(r.id),
      type: r.type,
      at: new Date(r.at as string).getTime(),
      label: r.label ? String(r.label) : undefined,
    }))
  );
}
