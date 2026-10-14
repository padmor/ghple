import { NextResponse } from "next/server";

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
