import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/server/db";
import { clientIp, fail, limited, readJson } from "@/server/http";
import { verifyPassword } from "@/server/password";
import { SESSION_COOKIE, SESSION_DAYS, signSession } from "@/server/session";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

// Compared against when the email is unknown, so timing doesn't reveal which emails exist
const DUMMY = "scrypt:00000000000000000000000000000000:" + "0".repeat(128);

export async function POST(req: Request) {
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail("Enter your email and password.");
  const { email, password } = parsed.data;

  if (limited(`login-ip:${clientIp(req)}`, 20, 15 * 60_000) || limited(`login:${email}`, 6, 15 * 60_000)) {
    return fail("Too many attempts. Please wait a few minutes and try again.", 429);
  }

  const [user] = await query<{ id: number; email: string; name: string; password_hash: string }>(
    "select id, email, name, password_hash from manager_users where email = $1",
    [email]
  );
  const ok = await verifyPassword(password, user?.password_hash ?? DUMMY);
  if (!user || !ok) return fail("That email or password is not right.", 401);

  await query("update manager_users set last_login_at = now() where id = $1", [user.id]);

  const res = NextResponse.json({ name: user.name, email: user.email });
  res.cookies.set(SESSION_COOKIE, await signSession({ uid: Number(user.id), email: user.email, name: user.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return res;
}
