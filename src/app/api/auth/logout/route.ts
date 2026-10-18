import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { query } from "@/server/db";
import { crossSite, fail } from "@/server/http";
import { SESSION_COOKIE, verifySession } from "@/server/session";

export async function POST(req: Request) {
  if (crossSite(req)) return fail("Blocked", 403);

  // End the session on the server, not just in this browser
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (session?.sid) await query("delete from manager_sessions where id = $1", [session.sid]).catch(() => undefined);

  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
