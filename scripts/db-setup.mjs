// Creates the tables and the starting content in your Neon database.
//   npm run db:setup
// Needs DATABASE_URL in .env.local (see .env.example). Safe to run again.
import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// Minimal .env.local reader so no extra package is needed
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing. Add it to .env.local (see .env.example) and run again.");
  process.exit(1);
}

const sql = neon(url);

// Split a file into single statements (the driver runs one at a time)
const statements = (file) =>
  readFileSync(file, "utf8")
    .replace(/--.*$/gm, "")
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);

for (const file of ["db/schema.sql", "db/seed.sql"]) {
  const list = statements(file);
  for (const statement of list) await sql.query(statement);
  console.log(`✓ ${file} (${list.length} statements)`);
}

const [{ count }] = await sql.query("select count(*)::int as count from products");
console.log(`Done. The database has ${count} products.`);
