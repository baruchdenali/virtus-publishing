import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Kimi OAuth callback — creates account + assigns admin role
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// tRPC API handler — all backend routes
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Health check
app.get("/api/health", (c) => c.json({
  ok: true,
  ts: Date.now(),
  hasDbUrl: !!process.env.DATABASE_URL,
  dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "NOT SET",
  nodeEnv: process.env.NODE_ENV || "not set",
}));

// 404 for unmatched API routes
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
