import { randomBytes } from "node:crypto";
import { query } from "@/server/db";
import { requireManager } from "@/server/auth";
import { fail, json } from "@/server/http";

export const dynamic = "force-dynamic";

const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024;

/** Manager: upload a product photo (the raw file as the request body). Returns the address to save on the product. */
export async function POST(req: Request) {
  const auth = await requireManager(req);
  if (auth instanceof Response) return auth;

  const mime = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!TYPES.has(mime)) return fail("Please upload a JPG, PNG or WebP photo.", 415);

  const bytes = Buffer.from(await req.arrayBuffer());
  if (bytes.length === 0) return fail("That file is empty.");
  if (bytes.length > MAX_BYTES) return fail("That photo is too large. Please use one under 2 MB.", 413);

  const id = randomBytes(9).toString("hex");
  await query("insert into images (id, mime, data) values ($1, $2, $3)", [id, mime, bytes]);
  return json({ url: `/api/images/${id}` }, 201);
}
