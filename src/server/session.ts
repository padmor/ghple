// Signed session cookie using the Web Crypto API, so the same code runs in the
// middleware (edge) and in route handlers (node). The secret never leaves the server.

export const SESSION_COOKIE = "gbhpl_session";
/** A manager stays signed in for this long, then must sign in again. */
export const SESSION_HOURS = 12;

export interface Session {
  uid: number;
  /** Server-side session id, so signing out (or an admin revoking it) really ends the session */
  sid: string;
  email: string;
  name: string;
  exp: number; // seconds since epoch
}

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(text: string) {
  const s = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

async function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters)");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(data: Omit<Session, "exp">): Promise<string> {
  const payload: Session = { ...data, exp: Math.floor(Date.now() / 1000) + SESSION_HOURS * 3600 };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await key(), enc.encode(body));
  return `${body}.${b64url(new Uint8Array(sig))}`;
}

/** Returns the session when the cookie is genuine and not expired, otherwise null. */
export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const session = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session;
    return session.exp > Math.floor(Date.now() / 1000) ? session : null;
  } catch {
    return null;
  }
}
