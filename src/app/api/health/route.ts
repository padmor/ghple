import { query } from "@/server/db";
import { json } from "@/server/http";

export const dynamic = "force-dynamic";

/**
 * Keep-warm check. The free database goes to sleep after a few minutes idle and the
 * first customer after that waits several seconds. Pinging this address every 4 to 5
 * minutes (UptimeRobot or cron-job.org, both free) keeps it awake.
 */
export async function GET() {
  try {
    await query("select 1");
    return json({ ok: true });
  } catch {
    return json({ ok: false }, 503);
  }
}
