import { query } from "@/server/db";
import { clientIp, fail, json, limited } from "@/server/http";
import { publicOrder, toLogEntry, toOrder } from "@/server/mappers";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (limited(`track:${clientIp(req)}`, 30, 60_000)) return fail("Too many requests", 429);
  const id = decodeURIComponent(params.id).trim().toUpperCase();
  if (!/^GBH-[A-Z0-9]{4,20}$/.test(id)) return fail("Order not found", 404);

  const [row] = await query("select * from orders where id = $1", [id]);
  if (!row) return fail("Order not found", 404);
  const log = (await query("select * from order_log where order_id = $1 order by at, id", [id])).map(toLogEntry);
  return json(publicOrder(toOrder(row, log)));
}
