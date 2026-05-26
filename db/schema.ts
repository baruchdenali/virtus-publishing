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
  boolean,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Ebook = typeof ebooks.$inferSelect;
export type InsertEbook = typeof ebooks.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type AiConversation = typeof aiConversations.$inferSelect;
export type AiMessage = typeof aiMessages.$inferSelect;
export type ActivityLog = typeof activityLog.$inferSelect;
