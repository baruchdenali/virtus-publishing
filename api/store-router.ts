import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { ebooks, reviews } from "@db/schema";
import { eq, and, desc, like, sql } from "drizzle-orm";

export const storeRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.enum(["fiction", "non-fiction", "business", "technology", "self-help", "academic", "other"]).optional(),
        search: z.string().optional(),
        sort: z.enum(["newest", "popular", "price-low", "price-high", "rating"]).default("newest"),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = [
        eq(ebooks.status, "published"),
        eq(ebooks.visibility, "public"),
      ];

      if (input?.category) {
        conditions.push(eq(ebooks.category, input.category));
      }
      if (input?.search) {
        conditions.push(like(ebooks.title, `%${input.search}%`));
      }

      const where = and(...conditions);

      let orderBy;
      switch (input?.sort) {
        case "popular":
          orderBy = desc(ebooks.publishedAt);
          break;
        case "price-low":
          orderBy = ebooks.price;
          break;
        case "price-high":
          orderBy = desc(ebooks.price);
          break;
        default:
          orderBy = desc(ebooks.publishedAt);
      }

      const items = await db
        .select({
          id: ebooks.id,
          title: ebooks.title,
          authorName: ebooks.authorName,
          description: ebooks.description,
          category: ebooks.category,
          coverImageUrl: ebooks.coverImageUrl,
          price: ebooks.price,
          isFree: ebooks.isFree,
          publishedAt: ebooks.publishedAt,
          pageCount: ebooks.pageCount,
          language: ebooks.language,
        })
        .from(ebooks)
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const itemsWithRatings = await Promise.all(
        items.map(async (item) => {
          const avgRating = await db
            .select({ avg: sql<number>`COALESCE(avg(rating), 0)::numeric` })
            .from(reviews)
            .where(eq(reviews.ebookId, item.id));

          const reviewCount = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(reviews)
            .where(eq(reviews.ebookId, item.id));

          return {
            ...item,
            rating: Number(avgRating[0]?.avg ?? 0),
            reviewCount: reviewCount[0]?.count ?? 0,
          };
        })
      );

      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(ebooks)
        .where(where);

      return {
        items: itemsWithRatings,
        total: countResult[0]?.count ?? 0,
        page,
        limit,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const ebook = await db
        .select()
        .from(ebooks)
        .where(and(eq(ebooks.id, input.id), eq(ebooks.status, "published"), eq(ebooks.visibility, "public")))
        .limit(1);

      if (!ebook[0]) {
        return null;
      }

      const avgRating = await db
        .select({ avg: sql<number>`COALESCE(avg(rating), 0)::numeric` })
        .from(reviews)
        .where(eq(reviews.ebookId, input.id));

      const reviewCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(reviews)
        .where(eq(reviews.ebookId, input.id));

      return {
        ...ebook[0],
        rating: Number(avgRating[0]?.avg ?? 0),
        reviewCount: reviewCount[0]?.count ?? 0,
      };
    }),

  categories: publicQuery.query(async () => {
    const db = getDb();

    const categories = await db
      .select({
        category: ebooks.category,
        count: sql<number>`count(*)::int`,
      })
      .from(ebooks)
      .where(and(eq(ebooks.status, "published"), eq(ebooks.visibility, "public")))
      .groupBy(ebooks.category);

    return categories;
  }),

  featured: publicQuery.query(async () => {
    const db = getDb();

    const items = await db
      .select({
        id: ebooks.id,
        title: ebooks.title,
        authorName: ebooks.authorName,
        description: ebooks.description,
        category: ebooks.category,
        coverImageUrl: ebooks.coverImageUrl,
        price: ebooks.price,
        isFree: ebooks.isFree,
        publishedAt: ebooks.publishedAt,
      })
      .from(ebooks)
      .where(and(eq(ebooks.status, "published"), eq(ebooks.visibility, "public")))
      .orderBy(desc(ebooks.publishedAt))
      .limit(6);

    const itemsWithRatings = await Promise.all(
      items.map(async (item) => {
        const avgRating = await db
          .select({ avg: sql<number>`COALESCE(avg(rating), 0)::numeric` })
          .from(reviews)
          .where(eq(reviews.ebookId, item.id));

        const reviewCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(reviews)
          .where(eq(reviews.ebookId, item.id));

        return {
          ...item,
          rating: Number(avgRating[0]?.avg ?? 0),
          reviewCount: reviewCount[0]?.count ?? 0,
        };
      })
    );

    return itemsWithRatings;
  }),
});
