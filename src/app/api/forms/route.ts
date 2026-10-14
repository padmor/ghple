import { z } from "zod";
import { query } from "@/server/db";
import { clientIp, fail, limited, noContent, readJson } from "@/server/http";

const schema = z.object({
  kind: z.enum(["feedback", "application"]),
  fields: z.record(z.string().max(60), z.string().max(3000)).refine((f) => Object.keys(f).length <= 12, "Too many fields"),
});

export async function POST(req: Request) {
  if (limited(`form:${clientIp(req)}`, 5, 10 * 60_000)) return fail("Too many submissions. Please try again later.", 429);
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Invalid form");
  await query("insert into form_submissions (kind, fields) values ($1, $2)", [parsed.data.kind, JSON.stringify(parsed.data.fields)]);
  return noContent();
}
