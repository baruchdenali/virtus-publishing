import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { purchases, ebooks } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const purchaseRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const items = await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));

    return items;
  }),

  create: authedQuery
    .input(z.object({ ebookId: z.number(), amount: z.string(), currency: z.string().default("USD") }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const ebook = await db
        .select()
        .from(ebooks)
        .where(eq(ebooks.id, input.ebookId))
        .limit(1);

      if (!ebook[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "eBook not found" });
      }

      const existingPurchase = await db
        .select()
        .from(purchases)
        .where(and(eq(purchases.userId, userId), eq(purchases.ebookId, input.ebookId), eq(purchases.status, "completed")))
        .limit(1);

      if (existingPurchase[0]) {
        throw new TRPCError({ code: "CONFLICT", message: "You already own this eBook" });
      }

      const result = await db.insert(purchases).values({
        userId,
        ebookId: input.ebookId,
        amount: input.amount,
        currency: input.currency,
        status: "completed",
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }).returning();

      return result[0];
    }),

  checkOwnership: authedQuery
    .input(z.object({ ebookId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const ebook = await db
        .select()
        .from(ebooks)
        .where(eq(ebooks.id, input.ebookId))
        .limit(1);

      if (ebook[0]?.isFree) {
        return { owned: true, isFree: true };
      }

      const purchase = await db
        .select()
        .from(purchases)
        .where(and(eq(purchases.userId, userId), eq(purchases.ebookId, input.ebookId), eq(purchases.status, "completed")))
        .limit(1);

      return { owned: !!purchase[0], isFree: false };
    }),
});
