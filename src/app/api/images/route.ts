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

  // The file must really be the image type it claims (not a script renamed to .jpg)
  const b = bytes;
  const real =
    (mime === "image/jpeg" && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ||
    (mime === "image/png" && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
    (mime === "image/webp" && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP");
  if (!real) return fail("That file is not a valid photo.", 415);

  const id = randomBytes(9).toString("hex");
  await query("insert into images (id, mime, data) values ($1, $2, $3)", [id, mime, bytes]);
  return json({ url: `/api/images/${id}` }, 201);
}
