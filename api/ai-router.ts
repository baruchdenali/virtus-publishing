// @ts-nocheck
import { z } from "zod";
import { createRouter, authedQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { aiConversations, aiMessages } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { generateWithOllama, detectIntent, SYSTEM_PROMPTS } from "./lib/ollama.js";

export const aiRouter = createRouter({
  listConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(aiConversations).where(eq(aiConversations.userId, ctx.user.id)).orderBy(desc(aiConversations.createdAt));
  }),

  createConversation: authedQuery
    .input(z.object({ title: z.string().optional(), ebookId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(aiConversations).values({
        userId: ctx.user.id,
        ebookId: input.ebookId,
        title: input.title ?? "New Conversation",
      }).returning();
      return result[0];
    }),

  listMessages: authedQuery
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conversation = await db.select().from(aiConversations).where(eq(aiConversations.id, input.conversationId)).limit(1);
      if (!conversation[0] || conversation[0].userId !== ctx.user.id) return [];
      return db.select().from(aiMessages).where(eq(aiMessages.conversationId, input.conversationId)).orderBy(aiMessages.createdAt);
    }),

  sendMessage: authedQuery
    .input(z.object({ conversationId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const conversation = await db.select().from(aiConversations).where(eq(aiConversations.id, input.conversationId)).limit(1);
      if (!conversation[0] || conversation[0].userId !== userId) return null;

      // Store user message
      await db.insert(aiMessages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.content,
      });

      // Generate response via Ollama (free, local) with graceful mock fallback
      const { text: responseText, model, source, tokensPerSecond, throttleLevel } = await generateWithOllama({
        prompt: input.content,
      });

      // Store AI response
      await db.insert(aiMessages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: responseText,
        model,
        tokensUsed: responseText.length,
      });

      return { success: true, response: responseText, model, source, tokensPerSecond, throttleLevel };
    }),

  generateOutline: authedQuery
    .input(z.object({ prompt: z.string(), ebookId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(aiConversations).values({
        userId: ctx.user.id,
        ebookId: input.ebookId,
        title: `Outline: ${input.prompt.slice(0, 50)}`,
      }).returning();
      const conv = result[0];

      await db.insert(aiMessages).values({
        conversationId: conv.id,
        role: "user",
        content: `Generate an outline for: ${input.prompt}`,
      });

      const { text: outline, model, source } = await generateWithOllama({
        prompt: `Generate a detailed chapter outline for an eBook about: ${input.prompt}`,
        system: SYSTEM_PROMPTS.outline,
      });

      await db.insert(aiMessages).values({
        conversationId: conv.id,
        role: "assistant",
        content: outline,
        model,
        tokensUsed: outline.length,
      });

      return { outline, conversationId: conv.id, source };
    }),

  generateChapter: authedQuery
    .input(z.object({ title: z.string(), prompt: z.string(), ebookId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const { text: chapter, model, source } = await generateWithOllama({
        prompt: `Write a full chapter titled "${input.title}" for an eBook. Context: ${input.prompt}`,
        system: SYSTEM_PROMPTS.chapter,
      });

      return { chapter, model, source };
    }),

  enhanceText: authedQuery
    .input(z.object({ text: z.string(), style: z.enum(["professional", "casual", "academic", "creative"]).default("professional") }))
    .mutation(async ({ input }) => {
      const { text: enhanced, model, source } = await generateWithOllama({
        prompt: `Enhance and refine the following text for a ${input.style} tone:\n\n${input.text}`,
        system: SYSTEM_PROMPTS.enhance,
      });

      return { enhanced, model, source };
    }),
});
