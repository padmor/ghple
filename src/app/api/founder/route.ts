import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query } from "@/server/db";
import { requireManager } from "@/server/auth";
import { fail, json, readJson } from "@/server/http";
import { toFounder } from "@/server/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  const [row] = await query("select * from founder where id = 1");
  return row ? json(toFounder(row)) : fail("Not set up", 404);
}

const schema = z
  .object({
    name: z.string().trim().max(120),
    title: z.string().trim().max(120),
    bio: z.string().trim().max(3000),
    quote: z.string().trim().max(400),
    photoPath: z.string().trim().max(500).regex(/^(\/[^\s]*)?$/, "Use an uploaded photo"),
  })
  .partial()
  .strict();

/** Manager: change the founder profile. */
export async function PATCH(req: Request) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Check the details and try again.");
  const c = parsed.data;

  const [row] = await query(
    `update founder set
       name       = coalesce($1, name),
       title      = coalesce($2, title),
       bio        = coalesce($3, bio),
       quote      = coalesce($4, quote),
       photo_path = coalesce($5, photo_path)
     where id = 1 returning *`,
    [c.name ?? null, c.title ?? null, c.bio ?? null, c.quote ?? null, c.photoPath ?? null]
  );
  revalidatePath("/", "layout");
  return json(toFounder(row));
}
