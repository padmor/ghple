// Adds (or updates) a manager login.   npm run manager:create
// Asks for email, name and password in the terminal, so the password never appears in
// a file, in Git, or in a chat. Needs DATABASE_URL in .env.local.
import { readFileSync, existsSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";
import { neon } from "@neondatabase/serverless";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local and run again.");
  process.exit(1);
}

const CTRL_C = String.fromCharCode(3);
const BACKSPACE = String.fromCharCode(127);
const BACKSPACE_ALT = String.fromCharCode(8);
const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);
const ERASE = String.fromCharCode(8) + " " + String.fromCharCode(8);

// Piped input (no real terminal): read plain lines
const pipedLines = process.stdin.isTTY ? null : createInterface({ input: process.stdin })[Symbol.asyncIterator]();

// Reads what you type key by key. Passwords print * for each key so you can see it is working.
function readLine(prompt, hidden = false) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    if (pipedLines) {
      pipedLines.next().then((r) => resolve(r.done ? "" : r.value));
      return;
    }
    const stdin = process.stdin;
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === CTRL_C) {
          process.stdout.write(LF);
          process.exit(130);
        } else if (ch === CR || ch === LF) {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write(LF);
          resolve(value);
          return;
        } else if (ch === BACKSPACE || ch === BACKSPACE_ALT) {
          if (value.length) {
            value = value.slice(0, -1);
            process.stdout.write(ERASE);
          }
        } else if (ch >= " ") {
          value += ch;
          process.stdout.write(hidden ? "*" : ch);
        }
      }
    };
    stdin.on("data", onData);
  });
}

const email = (await readLine("Email: ")).trim().toLowerCase();
const name = (await readLine("Name: ")).trim();
const password = await readLine("Password (at least 10 characters): ", true);
const again = await readLine("Repeat password: ", true);

if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("That does not look like an email address.");
if (password.length < 10) throw new Error("The password must be at least 10 characters.");
if (password !== again) throw new Error("The two passwords do not match.");

const salt = randomBytes(16);
const hash = scryptSync(password.normalize("NFKC"), salt, 64);
const stored = `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;

const sql = neon(process.env.DATABASE_URL);
await sql.query(
  `insert into manager_users (email, name, password_hash) values ($1, $2, $3)
   on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash`,
  [email, name, stored]
);
console.log(`Done: ${email} can now sign in at /manager`);
