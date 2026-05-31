import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

const FALLBACK_DATABASE_URL = "postgresql://neondb_owner:npg_Kbag4d6qjZsk@ep-damp-fog-apq27viw-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    instance = drizzle(pool, { schema: fullSchema });
  }
  return instance;
}
