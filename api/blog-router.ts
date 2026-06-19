// @ts-nocheck
import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { blogPosts } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const blogRouter = createRouter({
  list: publicQuery
    .input(z.object({ publishedOnly: z.boolean().default(true) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const publishedOnly = input?.publishedOnly ?? true;

      let query = db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

      if (publishedOnly) {
        return db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.published, true))
          .orderBy(desc(blogPosts.createdAt));
      }

      return query;
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, input.slug))
        .limit(1);
      return result[0] || null;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        author: z.string().optional(),
        category: z.string().optional(),
        image: z.string().optional(),
        published: z.boolean().default(false),
        featured: z.boolean().default(false),
        readTime: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db
        .insert(blogPosts)
        .values({
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt || "",
          content: input.content,
          author: input.author || "Virtus Editorial",
          category: input.category || "General",
          image: input.image || null,
          published: input.published,
          featured: input.featured,
          readTime: input.readTime || "5 min read",
        })
        .returning();
      return result[0];
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        author: z.string().optional(),
        category: z.string().optional(),
        image: z.string().optional(),
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
        readTime: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const result = await db
        .update(blogPosts)
        .set(data)
        .where(eq(blogPosts.id, id))
        .returning();
      return result[0];
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  togglePublish: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);
      if (!existing[0]) throw new Error("Post not found");

      const result = await db
        .update(blogPosts)
        .set({ published: !existing[0].published })
        .where(eq(blogPosts.id, input.id))
        .returning();
      return result[0];
    }),
});
