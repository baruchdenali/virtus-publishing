// @ts-nocheck
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth.js";
import { getLocalUserFromCookie } from "./local-auth-router.js";
import { getDb } from "./queries/connection.js";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try Kimi Auth first
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Not authenticated via Kimi
  }

  // If no Kimi user, try local auth
  if (!ctx.user) {
    try {
      const decoded = getLocalUserFromCookie(opts.req.headers);
      if (decoded) {
        const db = getDb();
        const result = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);
        ctx.user = result[0];
      }
    } catch {
      // Not authenticated locally
    }
  }

  return ctx;
}
