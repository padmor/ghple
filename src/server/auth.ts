import { cookies } from "next/headers";
import { query } from "@/server/db";
import { fail } from "@/server/http";
import { SESSION_COOKIE, verifySession, type Session } from "@/server/session";

/**
 * The signed cookie must be genuine AND its session must still exist on the server,
 * so signing out or removing a session ends it immediately, even if the cookie was copied.
 */
export async function currentSession(): Promise<Session | null> {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session?.sid) return null;
  const [live] = await query("select 1 from manager_sessions where id = $1 and expires_at > now()", [session.sid]);
  return live ? session : null;
}

/**
 * Use at the top of every manager-only endpoint:
 *   const auth = await requireManager(req);
 *   if (auth instanceof Response) return auth;
 * Writes must also come from this site: a browser always states where a request
 * came from, so a missing or foreign origin is refused.
 */
export async function requireManager(req: Request): Promise<Session | Response> {
  const session = await currentSession();
  if (!session) return fail("Sign in required", 401);

  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    let same = false;
    try {
      same = !!origin && !!host && new URL(origin).host === host;
    } catch {
      same = false;
    }
    if (!same) return fail("Blocked", 403);
  }
  return session;
}
