/**
 * Neon PostgreSQL Migration Script for Virtus Publishing
 *
 * Run this ONCE after setting your Neon DATABASE_URL:
 *   export DATABASE_URL="postgres://user:pass@neon-host/db"
 *   npx tsx db/neon-migrate.ts
 *
 * This script:
 * 1. Verifies connection to Neon
 * 2. Creates all tables if they don't exist
 * 3. Creates indexes for performance
 * 4. Seeds sample data for testing
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  console.error("Set it to your Neon connection string:");
  console.error("  export DATABASE_URL='postgres://user:password@host.neon.tech/dbname'");
  process.exit(1);
}

async function main() {
  console.log("Virtus Publishing - Neon PostgreSQL Migration\n");
  console.log("=============================================\n");

  // Step 1: Connect
  console.log("[1/5] Connecting to Neon PostgreSQL...");
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: true });

  try {
    const { rows } = await pool.query("SELECT version()");
    console.log(`      Connected: ${rows[0].version.split(" ").slice(0, 3).join(" ")}\n`);
  } catch (err: any) {
    console.error("      FAILED:", err.message);
    process.exit(1);
  }

  // Step 2: Create tables using Drizzle push
  console.log("[2/5] Creating tables with Drizzle...");
  const db = drizzle(pool, { schema });

  // Manual table creation for reliability
  const createTables = `
    DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS role AS ENUM ('user', 'admin');
      CREATE TYPE IF NOT EXISTS category AS ENUM ('fiction', 'non-fiction', 'business', 'technology', 'self-help', 'academic', 'other');
      CREATE TYPE IF NOT EXISTS status AS ENUM ('draft', 'in_progress', 'published', 'archived');
      CREATE TYPE IF NOT EXISTS visibility AS ENUM ('public', 'private');
      CREATE TYPE IF NOT EXISTS purchase_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
      CREATE TYPE IF NOT EXISTS message_role AS ENUM ('user', 'assistant', 'system');
    END $$;

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      "unionId" VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255),
      email VARCHAR(320),
      avatar TEXT,
      bio TEXT,
      website VARCHAR(255),
      role role NOT NULL DEFAULT 'user',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "lastSignInAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ebooks (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      "authorName" VARCHAR(255),
      description TEXT,
      category category DEFAULT 'other',
      status status DEFAULT 'draft',
      visibility visibility DEFAULT 'private',
      content TEXT,
      "coverImageUrl" TEXT,
      price DECIMAL(10,2) DEFAULT 0.00,
      currency VARCHAR(3) DEFAULT 'USD',
      "isFree" BOOLEAN DEFAULT FALSE,
      isbn VARCHAR(20),
      language VARCHAR(10) DEFAULT 'en',
      "pageCount" INTEGER,
      tags JSONB,
      "publishedAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER,
      "ebookId" INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      status purchase_status DEFAULT 'pending',
      "paymentMethod" VARCHAR(50),
      "transactionId" VARCHAR(255),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      "ebookId" INTEGER NOT NULL,
      "userId" INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "ebookId" INTEGER,
      title VARCHAR(255),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ai_messages (
      id SERIAL PRIMARY KEY,
      "conversationId" INTEGER NOT NULL,
      role message_role NOT NULL,
      content TEXT NOT NULL,
      model VARCHAR(50),
      "tokensUsed" INTEGER,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      action VARCHAR(50) NOT NULL,
      "resourceType" VARCHAR(50),
      "resourceId" INTEGER,
      metadata JSONB,
      "ipAddress" VARCHAR(45),
      "userAgent" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  try {
    await pool.query(createTables);
    console.log("      All tables created successfully.\n");
  } catch (err: any) {
    console.error("      ERROR:", err.message);
    process.exit(1);
  }

  // Step 3: Create indexes
  console.log("[3/5] Creating indexes...");
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_ebooks_userid ON ebooks("userId");
    CREATE INDEX IF NOT EXISTS idx_ebooks_status ON ebooks(status);
    CREATE INDEX IF NOT EXISTS idx_ebooks_category ON ebooks(category);
    CREATE INDEX IF NOT EXISTS idx_ebooks_visibility ON ebooks(visibility);
    CREATE INDEX IF NOT EXISTS idx_purchases_userid ON purchases("userId");
    CREATE INDEX IF NOT EXISTS idx_purchases_ebookid ON purchases("ebookId");
    CREATE INDEX IF NOT EXISTS idx_reviews_ebookid ON reviews("ebookId");
    CREATE INDEX IF NOT EXISTS idx_reviews_userid ON reviews("userId");
    CREATE INDEX IF NOT EXISTS idx_aimessages_convid ON ai_messages("conversationId");
    CREATE INDEX IF NOT EXISTS idx_aiconv_userid ON ai_conversations("userId");
    CREATE INDEX IF NOT EXISTS idx_activity_userid ON activity_log("userId");
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log("createdAt");
    CREATE INDEX IF NOT EXISTS idx_users_unionid ON users("unionId");
  `;

  try {
    await pool.query(createIndexes);
    console.log("      All indexes created successfully.\n");
  } catch (err: any) {
    console.error("      ERROR:", err.message);
  }

  // Step 4: Verify
  console.log("[4/5] Verifying tables...");
  const { rows: tables } = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  const expectedTables = ['users', 'ebooks', 'purchases', 'reviews', 'ai_conversations', 'ai_messages', 'activity_log'];
  const foundTables = tables.map((r: any) => r.table_name);

  for (const t of expectedTables) {
    const found = foundTables.includes(t);
    console.log(`      ${found ? '✓' : '✗'} ${t}`);
  }
  console.log();

  // Step 5: Seed sample data
  console.log("[5/5] Seeding sample data...");

  const hasUsers = await pool.query("SELECT COUNT(*)::int FROM users");
  if (hasUsers.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO users ("unionId", name, email, role, "lastSignInAt")
      VALUES
        ('demo_admin_001', 'Virtus Admin', 'admin@virtuspublishing.com', 'admin', NOW()),
        ('demo_user_001', 'Eleanor Vance', 'eleanor@example.com', 'user', NOW()),
        ('demo_user_002', 'Dr. Anya Sharma', 'anya@example.com', 'user', NOW()),
        ('demo_user_003', 'Ava Chen', 'ava@example.com', 'user', NOW())
      ON CONFLICT ("unionId") DO NOTHING
    `);
    console.log("      4 sample users created.");
  } else {
    console.log("      Users already exist, skipping.");
  }

  const hasEbooks = await pool.query("SELECT COUNT(*)::int FROM ebooks");
  if (hasEbooks.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO ebooks ("userId", title, "authorName", description, category, status, visibility, "coverImageUrl", price, "pageCount", language, tags, "publishedAt", "isFree")
      VALUES
        (1, 'The Art of Publishing', 'Eleanor Vance', 'A comprehensive guide to modern publishing with AI tools.', 'business', 'published', 'public', '/covers/cover-1.jpg', 24.99, 320, 'en', '["business", "publishing", "AI"]', NOW(), false),
        (2, 'TechWave: Navigating the Digital Frontier', 'Dr. Anya Sharma', 'Explore the intersection of technology and storytelling.', 'technology', 'published', 'public', '/covers/cover-2.jpg', 29.99, 410, 'en', '["technology", "digital", "future"]', NOW(), false),
        (3, 'The Unbecoming', 'Ava Chen', 'A transformative self-help journey to discover your true potential.', 'self-help', 'published', 'public', '/covers/cover-3.jpg', 0, 256, 'en', '["self-help", "transformation", "growth"]', NOW(), true),
        (1, 'The Architects of Knowledge', 'Dr. Elijah Vance', 'Foundations of Western thought and modern academia.', 'academic', 'published', 'public', '/covers/cover-4.jpg', 34.99, 520, 'en', '["academic", "philosophy", "education"]', NOW(), false),
        (2, 'The Unseen Ink', 'Isabella King', 'A fiction masterpiece about hidden stories and secret lives.', 'fiction', 'published', 'public', '/covers/cover-5.jpg', 19.99, 380, 'en', '["fiction", "mystery", "literary"]', NOW(), false),
        (3, 'Cosmic Forge', 'Dr. Laraine Cox', 'Science and innovation at the edge of human understanding.', 'technology', 'published', 'public', '/covers/cover-6.jpg', 27.99, 350, 'en', '["science", "innovation", "space"]', NOW(), false)
    `);
    console.log("      6 sample eBooks created.");
  } else {
    console.log("      eBooks already exist, skipping.");
  }

  // Update admin user from OWNER_UNION_ID
  if (process.env.OWNER_UNION_ID) {
    await pool.query(`
      UPDATE users SET role = 'admin' WHERE "unionId" = $1
    `, [process.env.OWNER_UNION_ID]);
    console.log(`      Set ${process.env.OWNER_UNION_ID} as admin.`);
  }

  console.log("\n=============================================");
  console.log("Migration complete! Your Neon DB is ready.");
  console.log("=============================================");
  console.log("\nNext steps:");
  console.log("  1. Set DATABASE_URL in Vercel dashboard");
  console.log("  2. Set KINDE_DOMAIN, KINDE_CLIENT_ID, KINDE_CLIENT_SECRET");
  console.log("  3. git push to deploy");
  console.log("\nNeon DB Dashboard: https://console.neon.tech");

  await pool.end();
}

main().catch(console.error);
