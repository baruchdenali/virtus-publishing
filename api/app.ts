import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { kindeClient, createSessionManager } from "./kinde/auth";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { env } from "./lib/env";
import { Paths } from "@contracts/constants";
import * as cookie from "cookie";

const COOKIE_NAME = "kinde_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Kimi OAuth callback
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// Kinde OAuth callback — handles login and registration
app.get("/api/kinde/callback", async (c) => {
  if (!kindeClient) {
    return c.redirect("/login?error=kinde_not_configured");
  }

  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.redirect("/login?error=missing_params");
  }

  try {
    const sessionManager = createSessionManager(state);
    await sessionManager.setSessionItem("code", code);
    await kindeClient.getToken(sessionManager);
    const userProfile = await kindeClient.getUserProfile(sessionManager);

    const db = getDb();
    const email = (userProfile as any).email || (userProfile as any).preferred_email || "";
    const picture = (userProfile as any).picture || "";
    const givenName = (userProfile as any).given_name || "";
    const familyName = (userProfile as any).family_name || "";

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.unionId, `kinde_${userProfile.id}`))
      .limit(1);

    let user = existing[0];
    const unionId = `kinde_${userProfile.id}`;
    const isOwner = unionId === env.ownerUnionId;

    if (!user) {
      const result = await db
        .insert(users)
        .values({
          unionId,
          name: `${givenName} ${familyName}`.trim() || email || "User",
          email: email || null,
          avatar: picture || null,
          role: isOwner ? "admin" : "user",
        })
        .returning();
      user = result[0];
    } else {
      await db
        .update(users)
        .set({
          lastSignInAt: new Date(),
          role: isOwner ? "admin" : user.role,
        })
        .where(eq(users.id, user.id));
    }

    // Set session cookie
    const cookieValue = cookie.serialize(COOKIE_NAME, state, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: COOKIE_MAX_AGE,
    });

    c.header("set-cookie", cookieValue);
    return c.redirect("/dashboard");
  } catch (error) {
    console.error("Kinde callback error:", error);
    return c.redirect("/login?error=auth_failed");
  }
});

// tRPC API handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Health check
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// 404 for unmatched API routes
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
