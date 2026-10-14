import { neon } from "@neondatabase/serverless";

/**
 * Server-only database access. Never import this from a component: DATABASE_URL
 * must stay on the server (it is not prefixed NEXT_PUBLIC_, so Next.js never sends
 * it to the browser).
 */
let client: ReturnType<typeof neon> | null = null;

export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

/** Run a parameterised query and get the rows back. Always pass values as parameters, never inside the text. */
export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await db().query(text, params)) as T[];
}
