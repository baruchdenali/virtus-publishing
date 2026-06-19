// @ts-nocheck
import { z } from "zod";
import { createRouter, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { users, ebooks, purchases, reviews, aiMessages, activityLog, subscriptions } from "@db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export const adminRouter = createRouter({
  overview: adminQuery.query(async () => {
    const db = getDb();

    const totalUsers = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const totalEbooks = await db.select({ count: sql<number>`count(*)::int` }).from(ebooks);
    const publishedEbooks = await db.select({ count: sql<number>`count(*)::int` }).from(ebooks).where(eq(ebooks.status, "published"));
    const totalPurchases = await db.select({ count: sql<number>`count(*)::int` }).from(purchases).where(eq(purchases.status, "completed"));
    const totalRevenue = await db.select({ total: sql<number>`COALESCE(sum(amount), 0)::numeric` }).from(purchases).where(eq(purchases.status, "completed"));
    const totalReviews = await db.select({ count: sql<number>`count(*)::int` }).from(reviews);
    const aiMessagesCount = await db.select({ count: sql<number>`count(*)::int` }).from(aiMessages);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newUsers7d = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, sevenDaysAgo));
    const newUsers30d = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, thirtyDaysAgo));
    const revenue30d = await db.select({ total: sql<number>`COALESCE(sum(amount), 0)::numeric` }).from(purchases).where(and(eq(purchases.status, "completed"), gte(purchases.createdAt, thirtyDaysAgo)));

    return {
      totalUsers: totalUsers[0]?.count ?? 0,
      totalEbooks: totalEbooks[0]?.count ?? 0,
      publishedEbooks: publishedEbooks[0]?.count ?? 0,
      totalPurchases: totalPurchases[0]?.count ?? 0,
      totalRevenue: Number(totalRevenue[0]?.total ?? 0),
      totalReviews: totalReviews[0]?.count ?? 0,
      aiMessagesCount: aiMessagesCount[0]?.count ?? 0,
      newUsers7d: newUsers7d[0]?.count ?? 0,
      newUsers30d: newUsers30d[0]?.count ?? 0,
      revenue30d: Number(revenue30d[0]?.total ?? 0),
    };
  }),

  revenueByDay: adminQuery
    .input(z.object({ days: z.number().min(1).max(90).default(30) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const rows = await db
        .select({
          date: sql<string>`DATE("createdAt")`,
          revenue: sql<number>`COALESCE(sum(amount), 0)::numeric`,
          count: sql<number>`count(*)::int`,
        })
        .from(purchases)
        .where(and(eq(purchases.status, "completed"), gte(purchases.createdAt, since)))
        .groupBy(sql`DATE("createdAt")`)
        .orderBy(sql`DATE("createdAt")`);

      const result: Record<string, { revenue: number; count: number }> = {};
      for (const row of rows) {
        result[row.date] = { revenue: Number(row.revenue), count: row.count };
      }

      const filled = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split("T")[0];
        filled.push({
          date: dateStr,
          revenue: result[dateStr]?.revenue ?? 0,
          count: result[dateStr]?.count ?? 0,
        });
      }

      return filled;
    }),

  userGrowth: adminQuery
    .input(z.object({ days: z.number().min(1).max(90).default(30) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const rows = await db
        .select({
          date: sql<string>`DATE("createdAt")`,
          count: sql<number>`count(*)::int`,
        })
        .from(users)
        .where(gte(users.createdAt, since))
        .groupBy(sql`DATE("createdAt")`)
        .orderBy(sql`DATE("createdAt")`);

      const result: Record<string, number> = {};
      for (const row of rows) {
        result[row.date] = row.count;
      }

      const filled = [];
      let cumulative = 0;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split("T")[0];
        const daily = result[dateStr] ?? 0;
        cumulative += daily;
        filled.push({ date: dateStr, daily, cumulative });
      }

      return filled;
    }),

  ebookActivity: adminQuery
    .input(z.object({ days: z.number().min(1).max(90).default(30) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const created = await db
        .select({
          date: sql<string>`DATE("createdAt")`,
          count: sql<number>`count(*)::int`,
        })
        .from(ebooks)
        .where(gte(ebooks.createdAt, since))
        .groupBy(sql`DATE("createdAt")`)
        .orderBy(sql`DATE("createdAt")`);

      const published = await db
        .select({
          date: sql<string>`DATE("publishedAt")`,
          count: sql<number>`count(*)::int`,
        })
        .from(ebooks)
        .where(and(gte(ebooks.publishedAt, since), eq(ebooks.status, "published")))
        .groupBy(sql`DATE("publishedAt")`)
        .orderBy(sql`DATE("publishedAt")`);

      const createdMap: Record<string, number> = {};
      for (const r of created) createdMap[r.date] = r.count;

      const publishedMap: Record<string, number> = {};
      for (const r of published) publishedMap[r.date] = r.count;

      const filled = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split("T")[0];
        filled.push({
          date: dateStr,
          created: createdMap[dateStr] ?? 0,
          published: publishedMap[dateStr] ?? 0,
        });
      }

      return filled;
    }),

  topBooks: adminQuery
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 10;

      const books = await db
        .select({
          id: ebooks.id,
          title: ebooks.title,
          authorName: ebooks.authorName,
          category: ebooks.category,
          price: ebooks.price,
          isFree: ebooks.isFree,
          status: ebooks.status,
          publishedAt: ebooks.publishedAt,
          coverImageUrl: ebooks.coverImageUrl,
          sales: sql<number>`(SELECT count(*)::int FROM purchases WHERE "ebookId" = ebooks.id AND status = 'completed')`,
          revenue: sql<number>`COALESCE((SELECT sum(amount)::numeric FROM purchases WHERE "ebookId" = ebooks.id AND status = 'completed'), 0)`,
          avgRating: sql<number>`COALESCE((SELECT avg(rating)::numeric FROM reviews WHERE "ebookId" = ebooks.id), 0)`,
          reviewCount: sql<number>`COALESCE((SELECT count(*)::int FROM reviews WHERE "ebookId" = ebooks.id), 0)`,
        })
        .from(ebooks)
        .orderBy(desc(ebooks.createdAt))
        .limit(limit);

      return books.map((b) => ({
        ...b,
        sales: Number(b.sales),
        revenue: Number(b.revenue),
        avgRating: Number(b.avgRating),
        reviewCount: Number(b.reviewCount),
      }));
    }),

  usersList: adminQuery
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(20) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const items = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          lastSignInAt: users.lastSignInAt,
          ebookCount: sql<number>`(SELECT count(*)::int FROM ebooks WHERE "userId" = users.id)`,
          purchaseCount: sql<number>`(SELECT count(*)::int FROM purchases WHERE "userId" = users.id)`,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(users);

      return {
        items: items.map((u) => ({
          ...u,
          ebookCount: Number(u.ebookCount),
          purchaseCount: Number(u.purchaseCount),
        })),
        total: totalResult[0]?.count ?? 0,
        page,
        limit,
      };
    }),

  recentActivity: adminQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;

      const logs = await db
        .select({
          id: activityLog.id,
          userId: activityLog.userId,
          action: activityLog.action,
          resourceType: activityLog.resourceType,
          resourceId: activityLog.resourceId,
          metadata: activityLog.metadata,
          createdAt: activityLog.createdAt,
          userName: users.name,
        })
        .from(activityLog)
        .leftJoin(users, eq(activityLog.userId, users.id))
        .orderBy(desc(activityLog.createdAt))
        .limit(limit);

      return logs;
    }),

  subscriptionsList: adminQuery.query(async () => {
    const db = getDb();
    const subs = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        tier: subscriptions.tier,
        status: subscriptions.status,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        createdAt: subscriptions.createdAt,
        name: users.name,
        email: users.email,
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .orderBy(desc(subscriptions.createdAt));

    const byTier = await db
      .select({ tier: subscriptions.tier, count: sql<number>`count(*)::int` })
      .from(subscriptions)
      .groupBy(subscriptions.tier);

    const byStatus = await db
      .select({ status: subscriptions.status, count: sql<number>`count(*)::int` })
      .from(subscriptions)
      .groupBy(subscriptions.status);

    return { subs, byTier, byStatus };
  }),

  categoryBreakdown: adminQuery.query(async () => {
    const db = getDb();

    const byCategory = await db
      .select({
        category: ebooks.category,
        count: sql<number>`count(*)::int`,
      })
      .from(ebooks)
      .groupBy(ebooks.category);

    const byStatus = await db
      .select({
        status: ebooks.status,
        count: sql<number>`count(*)::int`,
      })
      .from(ebooks)
      .groupBy(ebooks.status);

    return { byCategory, byStatus };
  }),
});
