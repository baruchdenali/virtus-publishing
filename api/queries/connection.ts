import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

const FALLBACK_DATABASE_URL = "postgresql://neondb_owner:npg_Kbag4d6qjZsk@ep-damp-fog-apq27viw-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

export function getDb() {
  if (!instance) {
    const dbUrl = process.env.DATABASE_URL || FALLBACK_DATABASE_URL;
    
    console.log("[DB] Using DATABASE_URL from:", process.env.DATABASE_URL ? "environment variable" : "fallback");
    
    const pool = new Pool({ connectionString: dbUrl });
    instance = drizzle(pool, { schema: fullSchema });
  }
  return instance;
}
