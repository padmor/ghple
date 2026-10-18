import { currentSession } from "@/server/auth";
import { fail, json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentSession();
  return session ? json({ name: session.name, email: session.email }) : fail("Not signed in", 401);
}
