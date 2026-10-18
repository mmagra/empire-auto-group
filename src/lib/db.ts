import { mkdirSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { DATA_DIR, DB_FILE } from "./paths";
import { SCHEMA_SQL } from "./schema-sql";

mkdirSync(DATA_DIR, { recursive: true });

function createClient() {
  const base = new PrismaClient({ datasources: { db: { url: `file:${DB_FILE}` } } });

  // Create the tables on first run, so a fresh server needs no migration step.
  let ready: Promise<void> | null = null;
  const ensureSchema = () =>
    (ready ??= (async () => {
      const existing = await base.$queryRawUnsafe<{ name: string }[]>("SELECT name FROM sqlite_master WHERE type='table' AND name='Vehicle'");
      if (existing.length) return;
      for (const statement of SCHEMA_SQL.split(/;\s*$/m)) {
        if (statement.trim()) await base.$executeRawUnsafe(statement);
      }
    })().catch((err) => {
      ready = null; // retry on the next query
      throw err;
    }));

  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        await ensureSchema();
        return query(args);
      },
    },
  });
}

type Db = ReturnType<typeof createClient>;
const globalForPrisma = globalThis as unknown as { empireDb?: Db };

export const db = globalForPrisma.empireDb ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.empireDb = db;
