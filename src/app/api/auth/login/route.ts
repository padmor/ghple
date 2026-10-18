import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/server/db";
import { clientIp, crossSite, fail, limitedDb, readJson } from "@/server/http";
import { verifyPassword } from "@/server/password";
import { randomBytes } from "node:crypto";
import { SESSION_COOKIE, SESSION_HOURS, signSession } from "@/server/session";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

// Compared against when the email is unknown, so timing doesn't reveal which emails exist
const DUMMY = "scrypt:00000000000000000000000000000000:" + "0".repeat(128);

export async function POST(req: Request) {
  if (crossSite(req)) return fail("Blocked", 403);
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Enter your email and password.");
  const { email, password } = parsed.data;

  if (
    (await limitedDb(`login-ip:${clientIp(req)}`, 20, 15 * 60_000)) ||
    (await limitedDb(`login:${email}`, 6, 15 * 60_000))
  ) {
    return fail("Too many attempts. Please wait a few minutes and try again.", 429);
  }

  const [user] = await query<{ id: number; email: string; name: string; password_hash: string }>(
    "select id, email, name, password_hash from manager_users where email = $1",
    [email]
  );
  const ok = await verifyPassword(password, user?.password_hash ?? DUMMY);
  if (!user || !ok) return fail("That email or password is not right.", 401);

  await query("update manager_users set last_login_at = now() where id = $1", [user.id]);

  // The session lives on the server too, so it can be ended for real (sign out, or removing the row)
  const sid = randomBytes(24).toString("hex");
  await query(
    "insert into manager_sessions (id, user_id, expires_at, ip, agent) values ($1, $2, now() + ($3 || ' hours')::interval, $4, $5)",
    [sid, user.id, String(SESSION_HOURS), clientIp(req), (req.headers.get("user-agent") ?? "").slice(0, 200)]
  );
  void query("delete from manager_sessions where expires_at < now()").catch(() => undefined);

  const res = NextResponse.json({ name: user.name, email: user.email });
  res.cookies.set(SESSION_COOKIE, await signSession({ uid: Number(user.id), sid, email: user.email, name: user.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return res;
}
