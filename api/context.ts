import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Kimi Auth — the one and only auth system
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Not authenticated — user stays undefined
  }

  return ctx;
}
