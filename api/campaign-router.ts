// @ts-nocheck
import { z } from "zod";
import { createRouter, operationsQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { campaigns } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const campaignRouter = createRouter({
  list: operationsQuery.query(async () => {
    const db = getDb();
    return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }),

  create: operationsQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        channel: z.string().min(1).max(50),
        content: z.string().min(1),
        status: z.enum(["draft", "scheduled", "running", "paused", "completed"]).default("draft"),
        scheduledAt: z.string().optional(),
        confidenceScore: z.number().min(0).max(100).default(90),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db
        .insert(campaigns)
        .values({
          name: input.name,
          channel: input.channel,
          content: input.content,
          status: input.status,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
          confidenceScore: String(input.confidenceScore),
          createdBy: ctx.user.id,
        })
        .returning();
      return result[0];
    }),

  updateStatus: operationsQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "scheduled", "running", "paused", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db
        .update(campaigns)
        .set({
          status: input.status,
          publishedAt: input.status === "running" ? new Date() : undefined,
        })
        .where(eq(campaigns.id, input.id))
        .returning();
      return result[0];
    }),

  delete: operationsQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(campaigns).where(eq(campaigns.id, input.id));
      return { success: true };
    }),
});
