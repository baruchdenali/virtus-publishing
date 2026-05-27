import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { kindeClient, createSessionManager, getSessionIdFromCookie, generateSessionId } from "./kinde/auth";
import { env } from "./lib/env";
import * as cookie from "cookie";

const COOKIE_NAME = "kinde_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const kindeRouter = createRouter({
  getLoginUrl: publicQuery.query(() => {
    if (!kindeClient) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Kinde auth not configured",
      });
    }

    const sessionId = generateSessionId();
    const kindeDomain = process.env.KINDE_DOMAIN || "";
    const kindeClientId = process.env.KINDE_CLIENT_ID || "";
    const redirectUri = process.env.KINDE_REDIRECT_URI || `${kindeDomain}/api/callback`;

    const loginUrl = `${kindeDomain}/oauth2/auth?` + new URLSearchParams({
      client_id: kindeClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      state: sessionId,
    }).toString();

    return { loginUrl, sessionId };
  }),

  callback: publicQuery
    .input(z.object({ code: z.string(), state: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!kindeClient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kinde not configured" });
      }

      const sessionManager = createSessionManager(input.state);

      try {
        // Store code in session for Kinde to pick up
      await sessionManager.setSessionItem("code", input.code);
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
          user.role = isOwner ? "admin" : user.role;
        }

        ctx.resHeaders.append(
          "set-cookie",
          cookie.serialize(COOKIE_NAME, input.state, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: COOKIE_MAX_AGE,
          })
        );

        return { success: true, user };
      } catch (error) {
        console.error("Kinde callback error:", error);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication failed",
        });
      }
    }),

  me: publicQuery.query(async ({ ctx }) => {
    if (!kindeClient) return null;

    const sessionId = getSessionIdFromCookie(ctx.req.headers);
    if (!sessionId) return null;

    const sessionManager = createSessionManager(sessionId);

    try {
      const isAuthenticated = await kindeClient.isAuthenticated(sessionManager);
      if (!isAuthenticated) return null;

      const userProfile = await kindeClient.getUserProfile(sessionManager);

      const db = getDb();
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.unionId, `kinde_${userProfile.id}`))
        .limit(1);

      return existing[0] || null;
    } catch {
      return null;
    }
  }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
      })
    );
    return { success: true };
  }),
});
