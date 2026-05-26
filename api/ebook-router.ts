import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { ebooks, purchases } from "@db/schema";
import { eq, and, desc, like, sql } from "drizzle-orm";

export const ebookRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        status: z.enum(["draft", "in_progress", "published", "archived"]).optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = [eq(ebooks.userId, userId)];
      if (input?.status) {
        conditions.push(eq(ebooks.status, input.status));
      }
      if (input?.search) {
        conditions.push(like(ebooks.title, `%${input.search}%`));
      }

      const where = conditions.length > 1 ? and(...conditions) : conditions[0];

      const items = await db
        .select()
        .from(ebooks)
        .where(where)
        .orderBy(desc(ebooks.updatedAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(ebooks)
        .where(where);

      return {
        items,
        total: countResult[0]?.count ?? 0,
        page,
        limit,
      };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const ebook = await db
        .select()
        .from(ebooks)
        .where(and(eq(ebooks.id, input.id), eq(ebooks.userId, userId)))
        .limit(1);

      if (!ebook[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "eBook not found" });
      }

      return ebook[0];
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        authorName: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["fiction", "non-fiction", "business", "technology", "self-help", "academic", "other"]).optional(),
        visibility: z.enum(["public", "private"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const result = await db.insert(ebooks).values({
        userId,
        title: input.title,
        authorName: input.authorName ?? ctx.user.name ?? "Anonymous",
        description: input.description,
        category: input.category ?? "other",
        visibility: input.visibility ?? "private",
        status: "draft",
      }).returning();

      return result[0];
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        authorName: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["fiction", "non-fiction", "business", "technology", "self-help", "academic", "other"]).optional(),
        status: z.enum(["draft", "in_progress", "published", "archived"]).optional(),
        visibility: z.enum(["public", "private"]).optional(),
        content: z.string().optional(),
        price: z.string().optional(),
        isFree: z.boolean().optional(),
        isbn: z.string().optional(),
        language: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const { id, ...data } = input;

      const existing = await db
        .select()
        .from(ebooks)
        .where(and(eq(ebooks.id, id), eq(ebooks.userId, userId)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "eBook not found" });
      }

      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.authorName !== undefined) updateData.authorName = data.authorName;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.visibility !== undefined) updateData.visibility = data.visibility;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.isFree !== undefined) updateData.isFree = data.isFree;
      if (data.isbn !== undefined) updateData.isbn = data.isbn;
      if (data.language !== undefined) updateData.language = data.language;
      if (data.tags !== undefined) updateData.tags = data.tags;

      const updated = await db.update(ebooks).set(updateData).where(eq(ebooks.id, id)).returning();
      return updated[0];
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db
        .select()
        .from(ebooks)
        .where(and(eq(ebooks.id, input.id), eq(ebooks.userId, userId)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "eBook not found" });
      }

      await db.delete(ebooks).where(eq(ebooks.id, input.id));
      return { success: true };
    }),

  publish: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(ebooks)
        .where(and(eq(ebooks.id, input.id), eq(ebooks.userId, ctx.user.id)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "eBook not found" });
      }

      const updated = await db
        .update(ebooks)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(ebooks.id, input.id))
        .returning();

      return updated[0];
    }),

  updateCover: authedQuery
    .input(z.object({ id: z.number(), coverImageUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db
        .update(ebooks)
        .set({ coverImageUrl: input.coverImageUrl })
        .where(and(eq(ebooks.id, input.id), eq(ebooks.userId, ctx.user.id)));

      return { success: true };
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

    const totalPurchases = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(purchases)
      .innerJoin(ebooks, eq(purchases.ebookId, ebooks.id))
      .where(and(eq(ebooks.userId, userId), eq(purchases.status, "completed")));

    const revenue = await db
      .select({ total: sql<number>`COALESCE(sum(purchases.amount), 0)::numeric` })
      .from(purchases)
      .innerJoin(ebooks, eq(purchases.ebookId, ebooks.id))
      .where(and(eq(ebooks.userId, userId), eq(purchases.status, "completed")));

    return {
      totalBooks: totalBooks[0]?.count ?? 0,
      publishedBooks: publishedBooks[0]?.count ?? 0,
      totalPurchases: totalPurchases[0]?.count ?? 0,
      revenue: Number(revenue[0]?.total ?? 0),
    };
  }),
});
