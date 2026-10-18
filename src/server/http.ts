import { NextResponse } from "next/server";
import { query } from "@/server/db";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export const noContent = () => new NextResponse(null, { status: 204 });

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

// Best-effort limiter kept in memory. It slows down a single noisy visitor; add a
// shared store (for example Upstash) if you ever need strict limits across servers.
const hits = new Map<string, { count: number; reset: number }>();

/** Returns true when `key` has used up `limit` requests inside the window. */
export function limited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || cur.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }
  cur.count += 1;
  return cur.count > limit;
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/**
 * Rate limit that every server instance shares (kept in the database), for the
 * routes where a limit really matters: sign-in, payments, cancelling and ordering.
 * Returns true when `key` has used up `limit` hits inside the window.
 */
export async function limitedDb(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const [row] = await query<{ count: number }>(
      `insert into rate_limits (key, count, reset_at) values ($1, 1, now() + ($2 || ' milliseconds')::interval)
       on conflict (key) do update set
         count = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
         reset_at = case when rate_limits.reset_at < now() then now() + ($2 || ' milliseconds')::interval else rate_limits.reset_at end
       returning count`,
      [key.slice(0, 200), String(windowMs)]
    );
    // Tidy old rows now and then so the table stays small
    if (Math.random() < 0.01) void query("delete from rate_limits where reset_at < now() - interval '1 day'").catch(() => undefined);
    return Number(row?.count ?? 0) > limit;
  } catch {
    return false; // a limiter hiccup must never block a real customer
  }
}

/** True when a browser sent this request from a different website (a cross-site forgery attempt). */
export function crossSite(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.headers.get("host");
  } catch {
    return true;
  }
}
