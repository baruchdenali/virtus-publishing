// @ts-nocheck
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { users, ebooks, purchases, reviews, subscriptions } from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const userRouter = createRouter({
  profile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        bio: users.bio,
        website: users.website,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user[0];
  }),

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().max(500).optional(),
        website: z.string().url().optional(),
        avatar: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.website !== undefined) updateData.website = input.website;
      if (input.avatar !== undefined) updateData.avatar = input.avatar;

      const updated = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
      return updated[0];
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const totalBooks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ebooks)
      .where(eq(ebooks.userId, userId));

    const publishedBooks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ebooks)
      .where(and(eq(ebooks.userId, userId), eq(ebooks.status, "published")));

    const inProgressBooks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ebooks)
      .where(and(eq(ebooks.userId, userId), eq(ebooks.status, "in_progress")));

    const draftBooks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ebooks)
      .where(and(eq(ebooks.userId, userId), eq(ebooks.status, "draft")));

    const totalPurchasesResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(purchases)
      .innerJoin(ebooks, eq(purchases.ebookId, ebooks.id))
      .where(and(eq(ebooks.userId, userId), eq(purchases.status, "completed")));

    const revenueResult = await db
      .select({ total: sql<number>`COALESCE(sum(purchases.amount), 0)::numeric` })
      .from(purchases)
      .innerJoin(ebooks, eq(purchases.ebookId, ebooks.id))
      .where(and(eq(ebooks.userId, userId), eq(purchases.status, "completed")));

    const totalReviewsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .innerJoin(ebooks, eq(reviews.ebookId, ebooks.id))
      .where(eq(ebooks.userId, userId));

    return {
      totalBooks: totalBooks[0]?.count ?? 0,
      publishedBooks: publishedBooks[0]?.count ?? 0,
      inProgressBooks: inProgressBooks[0]?.count ?? 0,
      draftBooks: draftBooks[0]?.count ?? 0,
      totalPurchases: totalPurchasesResult[0]?.count ?? 0,
      revenue: Number(revenueResult[0]?.total ?? 0),
      totalReviews: totalReviewsResult[0]?.count ?? 0,
    };
  }),

  subscription: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    if (!sub[0]) {
      return { hasActiveSubscription: false, tier: null, status: null, expiresAt: null };
    }
    const expired = sub[0].currentPeriodEnd ? new Date(sub[0].currentPeriodEnd) < new Date() : false;
    const active = !expired && (sub[0].status === "active" || sub[0].status === "trial");
    return {
      hasActiveSubscription: active,
      tier: sub[0].tier,
      status: sub[0].status,
      expiresAt: sub[0].currentPeriodEnd,
      cancelAtPeriodEnd: sub[0].cancelAtPeriodEnd,
    };
  }),
});
