import { scrypt as scryptCb, timingSafeEqual } from "node:crypto";

// Format: scrypt:<salt hex>:<hash hex>. scripts/create-manager.mjs writes the same format.
const KEYLEN = 64;

const derive = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) =>
    scryptCb(password.normalize("NFKC"), salt, KEYLEN, (err, key) => (err ? reject(err) : resolve(key)))
  );

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await derive(password, Buffer.from(saltHex, "hex"));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
