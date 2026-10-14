import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { query } from "@/server/db";
import { requireManager } from "@/server/auth";
import { fail, json, readJson } from "@/server/http";
import { toProduct } from "@/server/mappers";
import { productFields } from "@/server/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await query("select * from products order by sort, created_at");
  return json(rows.map(toProduct));
}

const createSchema = z.object({ name: z.string().trim().min(1).max(120).default("Gid's Apple Cider Vinegar"), ...productFields });

/** Manager: add a product. */
export async function POST(req: Request) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  const parsed = createSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Check the product details and try again.");
  const p = parsed.data;

  const id = `${p.size.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item"}-${randomBytes(3).toString("hex")}`;
  const [row] = await query(
    `insert into products (id, name, size, volume_ml, price, description, badge, image, in_stock, sort)
     values ($1, $2, $3, $4, $5, $6, nullif($7, ''), nullif($8, ''), $9, (select coalesce(max(sort), 0) + 1 from products))
     returning *`,
    [id, p.name, p.size, p.volumeMl, p.price, p.description, p.badge ?? "", p.image ?? "", p.inStock]
  );
  revalidatePath("/", "layout");
  return json(toProduct(row), 201);
}
