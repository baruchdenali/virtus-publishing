// @ts-nocheck
import { z } from "zod";
import { createRouter, salesQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { salesLeads } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const salesLeadRouter = createRouter({
  list: salesQuery.query(async () => {
    const db = getDb();
    return db.select().from(salesLeads).orderBy(desc(salesLeads.createdAt));
  }),

  create: salesQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        company: z.string().max(255).optional(),
        phone: z.string().max(50).optional(),
        source: z.string().max(50).default("website"),
        tier: z.enum(["creator", "professional", "publisher", "enterprise"]).optional(),
        notes: z.string().optional(),
        value: z.number().default(0),
        status: z.string().max(20).default("new"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db
        .insert(salesLeads)
        .values({
          name: input.name,
          email: input.email,
          company: input.company || null,
          phone: input.phone || null,
          source: input.source,
          tier: input.tier || null,
          notes: input.notes || null,
          value: String(input.value),
          status: input.status,
        })
        .returning();
      return result[0];
    }),

  update: salesQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().max(320).optional(),
        company: z.string().max(255).optional(),
        phone: z.string().max(50).optional(),
        tier: z.enum(["creator", "professional", "publisher", "enterprise"]).optional(),
        notes: z.string().optional(),
        value: z.number().optional(),
        status: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.company !== undefined) updateData.company = data.company;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.tier !== undefined) updateData.tier = data.tier;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.value !== undefined) updateData.value = String(data.value);
      if (data.status !== undefined) updateData.status = data.status;

      const result = await db.update(salesLeads).set(updateData).where(eq(salesLeads.id, id)).returning();
      return result[0];
    }),

  delete: salesQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(salesLeads).where(eq(salesLeads.id, input.id));
      return { success: true };
    }),
});
