// @ts-nocheck
import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { podcasts } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const podcastRouter = createRouter({
  list: publicQuery
    .input(z.object({ publishedOnly: z.boolean().default(true) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const publishedOnly = input?.publishedOnly ?? true;

      if (publishedOnly) {
        return db
          .select()
          .from(podcasts)
          .where(eq(podcasts.published, true))
          .orderBy(desc(podcasts.createdAt));
      }

      return db.select().from(podcasts).orderBy(desc(podcasts.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(podcasts)
        .where(eq(podcasts.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        guest: z.string().optional(),
        guestTitle: z.string().optional(),
        embedUrl: z.string().optional(),
        audioUrl: z.string().optional(),
        duration: z.string().default("30 min"),
        episodeNumber: z.number().optional(),
        date: z.string().optional(),
        plays: z.number().default(0),
        featured: z.boolean().default(false),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(podcasts).values(input).returning();
      return result[0];
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        guest: z.string().optional(),
        guestTitle: z.string().optional(),
        embedUrl: z.string().optional(),
        audioUrl: z.string().optional(),
        duration: z.string().optional(),
        episodeNumber: z.number().optional(),
        date: z.string().optional(),
        plays: z.number().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const result = await db
        .update(podcasts)
        .set(data)
        .where(eq(podcasts.id, id))
        .returning();
      return result[0];
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(podcasts).where(eq(podcasts.id, input.id));
      return { success: true };
    }),

  togglePublish: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(podcasts)
        .where(eq(podcasts.id, input.id))
        .limit(1);
      if (!existing[0]) throw new Error("Podcast not found");

      const result = await db
        .update(podcasts)
        .set({ published: !existing[0].published })
        .where(eq(podcasts.id, input.id))
        .returning();
      return result[0];
    }),

  incrementPlays: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(podcasts)
        .where(eq(podcasts.id, input.id))
        .limit(1);
      if (!existing[0]) return null;

      const result = await db
        .update(podcasts)
        .set({ plays: (existing[0].plays || 0) + 1 })
        .where(eq(podcasts.id, input.id))
        .returning();
      return result[0];
    }),
});
