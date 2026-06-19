// @ts-nocheck
import { z } from "zod";
import { createRouter, operationsQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { users } from "@db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export const teamRouter = createRouter({
  list: operationsQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
        lastSignInAt: users.lastSignInAt,
      })
      .from(users)
      .where(inArray(users.role, ["admin", "operations", "sales"]))
      .orderBy(desc(users.createdAt));
  }),

  updateRole: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "author", "sales", "operations", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.id))
        .returning();
      return result[0];
    }),

  remove: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: "user" }).where(eq(users.id, input.id));
      return { success: true };
    }),
});
