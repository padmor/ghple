import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query } from "@/server/db";
import { requireManager } from "@/server/auth";
import { fail, json, noContent, readJson } from "@/server/http";
import { toProduct } from "@/server/mappers";
import { productFields } from "@/server/schemas";

export const dynamic = "force-dynamic";

const schema = z.object({ name: z.string().trim().min(1).max(120), ...productFields }).partial().strict();

/** Manager: change some fields of a product. Leave a field out to keep it; send "" to clear badge or image. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Check the product details and try again.");
  const c = parsed.data;

  const has = (v: unknown) => v !== undefined;
  const [row] = await query(
    `update products set
       name        = coalesce($2, name),
       size        = coalesce($3, size),
       volume_ml   = coalesce($4, volume_ml),
       price       = coalesce($5, price),
       description = coalesce($6, description),
       badge       = case when $7::boolean then nullif($8, '') else badge end,
       image       = case when $9::boolean then nullif($10, '') else image end,
       in_stock    = coalesce($11, in_stock)
     where id = $1
     returning *`,
    [
      decodeURIComponent(params.id),
      c.name ?? null,
      c.size ?? null,
      c.volumeMl ?? null,
      c.price ?? null,
      c.description ?? null,
      has(c.badge),
      c.badge ?? "",
      has(c.image),
      c.image ?? "",
      c.inStock ?? null,
    ]
  );
  revalidatePath("/", "layout");
  return row ? json(toProduct(row)) : fail("Product not found", 404);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  await query("delete from products where id = $1", [decodeURIComponent(params.id)]);
  revalidatePath("/", "layout");
  return noContent();
}
