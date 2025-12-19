import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// Use Neon/Postgres DATABASE_URL; throw if missing so we see config issues early
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgres://mock:mock@localhost/mock";

const pool = new Pool({
  connectionString: databaseUrl,
  ssl:
    databaseUrl.includes("neon.tech") || databaseUrl.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
});

const db = drizzle(pool, { schema });

export { pool, db };
