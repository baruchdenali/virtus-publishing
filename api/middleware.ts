// @ts-nocheck
import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context.js";
import { getDb } from "./queries/connection.js";
import { subscriptions } from "@db/schema";
import { eq, and, gte } from "drizzle-orm";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(role: string) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("admin"));

// Operations role: admin OR operations
const requireOperations = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user || (ctx.user.role !== "admin" && ctx.user.role !== "operations")) {
    throw new TRPCError({ code: "FORBIDDEN", message: ErrorMessages.insufficientRole });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
export const operationsQuery = authedQuery.use(requireOperations);

// Sales role: admin OR operations OR sales
const requireSales = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user || (ctx.user.role !== "admin" && ctx.user.role !== "operations" && ctx.user.role !== "sales")) {
    throw new TRPCError({ code: "FORBIDDEN", message: ErrorMessages.insufficientRole });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
export const salesQuery = authedQuery.use(requireSales);

// Subscription gate: requires an active, non-expired subscription (or admin bypass)
const requireSubscription = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: ErrorMessages.unauthenticated });
  }
  // Admin always bypasses subscription check
  if (ctx.user.role === "admin" || ctx.user.role === "operations") {
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
  const db = getDb();
  const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id)).limit(1);
  if (!sub[0] || (sub[0].status !== "active" && sub[0].status !== "trial")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "subscription_required" });
  }
  // Check expiration
  if (sub[0].currentPeriodEnd && new Date(sub[0].currentPeriodEnd) < new Date()) {
    throw new TRPCError({ code: "FORBIDDEN", message: "subscription_expired" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
export const subscribedQuery = authedQuery.use(requireSubscription);
