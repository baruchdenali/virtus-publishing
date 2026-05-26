import { relations } from "drizzle-orm";
import { users, ebooks, purchases, reviews, aiConversations, aiMessages, activityLog } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  ebooks: many(ebooks),
  purchases: many(purchases),
  reviews: many(reviews),
  aiConversations: many(aiConversations),
}));

export const ebooksRelations = relations(ebooks, ({ one, many }) => ({
  user: one(users, { fields: [ebooks.userId], references: [users.id] }),
  purchases: many(purchases),
  reviews: many(reviews),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
  ebook: one(ebooks, { fields: [purchases.ebookId], references: [ebooks.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  ebook: one(ebooks, { fields: [reviews.ebookId], references: [ebooks.id] }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, { fields: [aiConversations.userId], references: [users.id] }),
  ebook: one(ebooks, { fields: [aiConversations.ebookId], references: [ebooks.id] }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, { fields: [aiMessages.conversationId], references: [aiConversations.id] }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, { fields: [activityLog.userId], references: [users.id] }),
}));
