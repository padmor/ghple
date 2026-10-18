import { query } from "@/server/db";

export const dynamic = "force-dynamic";

/** Public: serve an uploaded product photo. Each upload has its own ID and never changes, so it can be cached for good. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  if (!/^[a-f0-9]{18}$/.test(params.id)) return new Response("Not found", { status: 404 });

  const [row] = await query<{ mime: string; data: Buffer | Uint8Array | string }>(
    "select mime, data from images where id = $1",
    [params.id]
  );
  if (!row) return new Response("Not found", { status: 404 });

  // Neon returns bytea as a Buffer or a \x-prefixed hex string depending on the driver mode
  const body =
    typeof row.data === "string" ? Buffer.from(row.data.replace(/^\\x/, ""), "hex") : Buffer.from(row.data as Uint8Array);

  return new Response(body, {
    headers: {
      "Content-Type": row.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
