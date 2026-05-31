import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const dbUrl = process.env.DATABASE_URL || "";
    
    if (!dbUrl) {
      console.error("[CRITICAL] DATABASE_URL is empty or undefined!");
      console.error("[CRITICAL] Available env keys:", Object.keys(process.env).filter(k => !k.includes("SECRET") && !k.includes("KEY") && !k.includes("PASS")));
      throw new Error("DATABASE_URL environment variable is not set. Please add it in Vercel Settings > Environment Variables.");
    }
    
    console.log("[DB] Connecting with DATABASE_URL length:", dbUrl.length);
    console.log("[DB] DATABASE_URL starts with:", dbUrl.substring(0, 30) + "...");
    
    const pool = new Pool({ connectionString: dbUrl });
    instance = drizzle(pool, { schema: fullSchema });
  }
  return instance;
}
