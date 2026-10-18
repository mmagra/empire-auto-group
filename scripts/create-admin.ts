// Create (or reset the password of) an admin user.
//
//   npm run admin:create -- owner@example.com "Owner Name" "a-strong-password"
//
// If the password is omitted a random one is generated and printed.
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
// Uses the app's own client so the data folder and tables are set up the same way.
import { db } from "../src/lib/db";

async function main() {
  const [emailArg, nameArg, passwordArg] = process.argv.slice(2);
  if (!emailArg) {
    console.error('Usage: npm run admin:create -- <email> "<name>" [password]');
    process.exit(1);
  }
  const email = emailArg.trim().toLowerCase();
  const name = nameArg?.trim() || email.split("@")[0];
  const password = passwordArg || randomBytes(9).toString("base64url");
  if (password.length < 10) {
    console.error("Password must be at least 10 characters.");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.adminUser.upsert({ where: { email }, create: { email, name, passwordHash }, update: { name, passwordHash } });
  console.log(`\nAdmin ready: ${user.email}`);
  if (!passwordArg) console.log(`Password:    ${password}\n(Change it in Admin → Settings after signing in.)\n`);
}

main().finally(() => db.$disconnect());
