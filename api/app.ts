import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { getDb } from "./queries/connection";
import { Paths } from "@contracts/constants";

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Kimi OAuth callback — creates account + assigns admin role
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// Direct DB test using pg Pool
app.get("/api/dbtest", async (c) => {
  try {
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Kbag4d6qjZsk@ep-damp-fog-apq27viw-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require",
      ssl: { rejectUnauthorized: false },
    });
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    const usersCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
    await pool.end();
    return c.json({
      ok: true,
      tables: tables.rows.map((r: any) => r.table_name),
      usersColumns: usersCols.rows.map((r: any) => `${r.column_name}(${r.data_type})`),
    });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message, code: e.code }, 500);
  }
});

// tRPC API handler — all backend routes
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Health check
app.get("/api/health", async (c) => {
  const dbUrl = process.env.DATABASE_URL || "fallback";
  return c.json({
    ok: true,
    ts: Date.now(),
    hasDbUrl: dbUrl.length > 10,
    dbUrlPrefix: dbUrl.substring(0, 25) + "...",
    nodeEnv: process.env.NODE_ENV || "not set",
  });
});

// 404 for unmatched API routes
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
