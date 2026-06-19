import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  jsonb,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "author", "sales", "operations", "admin"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["creator", "professional", "publisher", "enterprise"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "expired", "trial"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "scheduled", "running", "paused", "completed"]);
export const categoryEnum = pgEnum("category", [
  "fiction",
  "non-fiction",
  "business",
  "technology",
  "self-help",
  "academic",
  "other",
]);
export const statusEnum = pgEnum("status", ["draft", "in_progress", "published", "archived"]);
export const visibilityEnum = pgEnum("visibility", ["public", "private"]);
export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  avatar: text("avatar"),
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt", { mode: "date" }).defaultNow().notNull(),
});

export const ebooks = pgTable("ebooks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  authorName: varchar("authorName", { length: 255 }),
  description: text("description"),
  category: categoryEnum("category").default("other"),
  status: statusEnum("status").default("draft"),
  visibility: visibilityEnum("visibility").default("private"),
  content: text("content"),
  coverImageUrl: text("coverImageUrl"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  isFree: boolean("isFree").default(false),
  isbn: varchar("isbn", { length: 20 }),
  language: varchar("language", { length: 10 }).default("en"),
  pageCount: integer("pageCount"),
  tags: jsonb("tags").$type<string[]>(),
  publishedAt: timestamp("publishedAt", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  ebookId: integer("ebookId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: purchaseStatusEnum("status").default("pending"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  ebookId: integer("ebookId").notNull(),
  userId: integer("userId").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  ebookId: integer("ebookId"),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  model: varchar("model", { length: 50 }),
  tokensUsed: integer("tokensUsed"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  resourceType: varchar("resourceType", { length: 50 }),
  resourceId: integer("resourceId"),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }).default("Virtus Editorial"),
  category: varchar("category", { length: 50 }).default("General"),
  image: text("image"),
  published: boolean("published").default(false),
  featured: boolean("featured").default(false),
  readTime: varchar("readTime", { length: 20 }).default("5 min read"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export const podcasts = pgTable("podcasts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  guest: varchar("guest", { length: 255 }),
  guestTitle: varchar("guestTitle", { length: 255 }),
  embedUrl: text("embedUrl"),
  audioUrl: text("audioUrl"),
  duration: varchar("duration", { length: 20 }).default("30 min"),
  episodeNumber: integer("episodeNumber"),
  date: varchar("date", { length: 50 }),
  plays: integer("plays").default(0),
  featured: boolean("featured").default(false),
  published: boolean("published").default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  tier: subscriptionTierEnum("tier").notNull().default("creator"),
  status: subscriptionStatusEnum("status").notNull().default("trial"),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  currentPeriodStart: timestamp("currentPeriodStart", { mode: "date" }),
  currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date" }),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  serviceType: varchar("serviceType", { length: 50 }).notNull(),
  ebookId: integer("ebookId"),
  quantity: integer("quantity").default(1),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("completed"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  channel: varchar("channel", { length: 50 }).notNull(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  content: text("content"),
  scheduledAt: timestamp("scheduledAt", { mode: "date" }),
  publishedAt: timestamp("publishedAt", { mode: "date" }),
  metrics: jsonb("metrics"),
  engagement: integer("engagement").default(0),
  reach: integer("reach").default(0),
  conversions: integer("conversions").default(0),
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }).default("0"),
  createdBy: integer("createdBy"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const salesLeads = pgTable("sales_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  source: varchar("source", { length: 50 }).default("website"),
  tier: subscriptionTierEnum("tier"),
  notes: text("notes"),
  assignedTo: integer("assignedTo"),
  status: varchar("status", { length: 20 }).default("new"),
  value: decimal("value", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Ebook = typeof ebooks.$inferSelect;
export type InsertEbook = typeof ebooks.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type AiConversation = typeof aiConversations.$inferSelect;
export type AiMessage = typeof aiMessages.$inferSelect;
export type ActivityLog = typeof activityLog.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Podcast = typeof podcasts.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
// ===================================================================
// MODULE 1: AdGPT Isolated Microservice Tables
// ===================================================================

export const virtusAiCampaigns = pgTable("virtus_ai_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  associatedUrl: text("associated_url").notNull(),
  generatedAt: timestamp("generated_at", { mode: "date" }).defaultNow().notNull(),
  bookTitle: text("book_title").notNull(),
  bookAuthor: text("book_author"),
  bookCoverUrl: text("book_cover_url"),
  encryptedPayload: text("encrypted_payload").notNull(),
  iv: varchar("iv", { length: 64 }).notNull(),
  authTag: varchar("auth_tag", { length: 64 }).notNull(),
  createdBy: integer("created_by").notNull(),
  campaignStatus: varchar("campaign_status", { length: 32 }).default("draft").notNull(),
});

export const virtusClientLedgers = pgTable("virtus_client_ledgers", {
  clientId: varchar("client_id", { length: 64 }).primaryKey(),
  marketingCredits: integer("marketing_credits").default(0).notNull(),
  subscriptionTier: varchar("subscription_tier", { length: 32 }).default("creator").notNull(),
  lastDebitTimestamp: timestamp("last_debit_timestamp", { mode: "date" }),
});

export const virtusStaffIntegrations = pgTable("virtus_staff_integrations", {
  staffId: varchar("staff_id", { length: 64 }).primaryKey(),
  platform: varchar("platform", { length: 32 }).notNull(),
  linkedAt: timestamp("linked_at", { mode: "date" }).defaultNow().notNull(),
  encryptedCredentials: text("encrypted_credentials").notNull(),
  iv: varchar("iv", { length: 64 }).notNull(),
  authTag: varchar("auth_tag", { length: 64 }).notNull(),
});

export type SalesLead = typeof salesLeads.$inferSelect;
export type VirtusAiCampaign = typeof virtusAiCampaigns.$inferSelect;
export type VirtusClientLedger = typeof virtusClientLedgers.$inferSelect;
export type VirtusStaffIntegration = typeof virtusStaffIntegrations.$inferSelect;
