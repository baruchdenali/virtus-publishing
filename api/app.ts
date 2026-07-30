// @ts-nocheck
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { createOAuthCallbackHandler } from "./kimi/auth.js";
import { getDb } from "./queries/connection.js";
import { Paths } from "@contracts/constants";

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Kimi OAuth callback — creates account + assigns admin role
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// Direct DB test and schema setup
app.get("/api/dbtest", async (c) => {
  try {
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Kbag4d6qjZsk@ep-damp-fog-apq27viw-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require",
      ssl: { rejectUnauthorized: false },
    });

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "unionId" VARCHAR(255) NOT NULL UNIQUE,
        "name" VARCHAR(255),
        "email" VARCHAR(320),
        "passwordHash" VARCHAR(255),
        "avatar" TEXT,
        "bio" TEXT,
        "website" VARCHAR(255),
        "role" VARCHAR(10) NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "lastSignInAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "ebooks" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL DEFAULT 1,
        "title" VARCHAR(255) NOT NULL,
        "authorName" VARCHAR(255),
        "description" TEXT,
        "category" VARCHAR(50) DEFAULT 'other',
        "coverImageUrl" TEXT,
        "price" NUMERIC(10,2) DEFAULT 0,
        "currency" VARCHAR(3) DEFAULT 'USD',
        "isFree" BOOLEAN DEFAULT FALSE,
        "content" TEXT,
        "status" VARCHAR(20) DEFAULT 'draft',
        "visibility" VARCHAR(20) DEFAULT 'private',
        "publishedAt" TIMESTAMP,
        "pageCount" INTEGER DEFAULT 0,
        "isbn" VARCHAR(20),
        "language" VARCHAR(10) DEFAULT 'en',
        "tags" JSONB DEFAULT '[]'::jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Add missing columns to existing ebooks table (idempotent)
    await pool.query(`ALTER TABLE "ebooks" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(3) DEFAULT 'USD'`);
    await pool.query(`ALTER TABLE "ebooks" ADD COLUMN IF NOT EXISTS "isbn" VARCHAR(20)`);
    await pool.query(`ALTER TABLE "ebooks" ADD COLUMN IF NOT EXISTS "tags" JSONB DEFAULT '[]'::jsonb`);
    await pool.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(3) DEFAULT 'USD'`);
    await pool.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "paymentMethod" VARCHAR(50)`);
    await pool.query(`ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "transactionId" VARCHAR(255)`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "purchases" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "ebookId" INTEGER NOT NULL,
        "amount" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "status" VARCHAR(20) DEFAULT 'completed',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" SERIAL PRIMARY KEY,
        "ebookId" INTEGER NOT NULL,
        "userId" INTEGER NOT NULL,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "comment" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(255) NOT NULL UNIQUE,
        "excerpt" TEXT,
        "content" TEXT NOT NULL,
        "author" VARCHAR(255) DEFAULT 'Virtus Editorial',
        "category" VARCHAR(50) DEFAULT 'General',
        "image" TEXT,
        "published" BOOLEAN DEFAULT FALSE,
        "featured" BOOLEAN DEFAULT FALSE,
        "readTime" VARCHAR(20) DEFAULT '5 min read',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "podcasts" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "guest" VARCHAR(255),
        "guestTitle" VARCHAR(255),
        "embedUrl" TEXT,
        "audioUrl" TEXT,
        "duration" VARCHAR(20) DEFAULT '30 min',
        "episodeNumber" INTEGER,
        "date" VARCHAR(50),
        "plays" INTEGER DEFAULT 0,
        "featured" BOOLEAN DEFAULT FALSE,
        "published" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Update admin password
    await pool.query(`
      UPDATE "users" SET "passwordHash" = '$2b$12$/Btx3Ifs0j8pCRZnDvP7jO2naNR0bK4mwnXvoQ3I4dPNRsCTcOpRe', "role" = 'admin'
      WHERE "email" = 'baruch.denali@gmail.com'
    `);

    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    await pool.end();

    return c.json({
      ok: true,
      tables: tables.rows.map((r: any) => r.table_name),
      message: "Schema created successfully",
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
