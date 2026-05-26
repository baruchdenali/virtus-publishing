import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { kindeClient, createSessionManager, getSessionIdFromCookie } from "./kinde/auth";
import { getDb } from "./queries/connection";
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

  // Try Kimi auth first
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Kimi auth failed, try Kinde
  }

  // Try Kinde auth if Kimi didn't work
  if (!ctx.user && kindeClient) {
    try {
      const sessionId = getSessionIdFromCookie(opts.req.headers);
      if (sessionId) {
        const sessionManager = createSessionManager(sessionId);
        const isAuthenticated = await kindeClient.isAuthenticated(sessionManager);
        if (isAuthenticated) {
          const userProfile = await kindeClient.getUserProfile(sessionManager);
          const db = getDb();
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.unionId, `kinde_${userProfile.id}`))
            .limit(1);
          if (existing[0]) {
            ctx.user = existing[0];
          }
        }
      }
    } catch {
      // Kinde auth failed too
    }
  }

  return ctx;
}
