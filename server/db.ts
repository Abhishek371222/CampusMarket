import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use mock database URL for development if not set
const databaseUrl = process.env.DATABASE_URL || 'postgres://mock:mock@localhost/mock';

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

try {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
} catch (error) {
  console.warn('Database connection not available, using mock data mode');
  // Mock mode - client can still work with mock data
}

export { pool, db };
