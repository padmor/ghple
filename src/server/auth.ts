import { cookies } from "next/headers";
import { fail } from "@/server/http";
import { SESSION_COOKIE, verifySession, type Session } from "@/server/session";

export async function currentSession(): Promise<Session | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

/**
 * Use at the top of every manager-only endpoint:
 *   const auth = await requireManager(req);
 *   if (auth instanceof Response) return auth;
 * Also rejects cross-site writes by checking the request's Origin.
 */
export async function requireManager(req: Request): Promise<Session | Response> {
  const session = await currentSession();
  if (!session) return fail("Sign in required", 401);

  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) return fail("Blocked", 403);
  }
  return session;
}
