import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const reviewRouter = createRouter({
  list: publicQuery
    .input(z.object({ ebookId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const items = await db
        .select({
          id: reviews.id,
          ebookId: reviews.ebookId,
          userId: reviews.userId,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          userName: users.name,
          userAvatar: users.avatar,
        })
        .from(reviews)
        .where(eq(reviews.ebookId, input.ebookId))
        .leftJoin(users, eq(reviews.userId, users.id))
        .orderBy(desc(reviews.createdAt));

      return items;
    }),

  create: authedQuery
    .input(
      z.object({
        ebookId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db
        .select()
        .from(reviews)
        .where(eq(reviews.ebookId, input.ebookId))
        .limit(1);

      if (existing.length > 0) {
        const updated = await db
          .update(reviews)
          .set({ rating: input.rating, comment: input.comment })
          .where(eq(reviews.id, existing[0].id))
          .returning();
        return updated[0];
      }

      const result = await db.insert(reviews).values({
        userId,
        ebookId: input.ebookId,
        rating: input.rating,
        comment: input.comment,
      }).returning();

      return result[0];
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, input.id))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
      }

      if (existing[0].userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete another user's review" });
      }

      await db.delete(reviews).where(eq(reviews.id, input.id));
      return { success: true };
    }),
});
