import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { env } from "./lib/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const COOKIE_NAME = "virtus_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const JWT_SECRET = env.appSecret || "virtus-local-auth-fallback-secret";

function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch {
    return null;
  }
}

export function getLocalUserFromCookie(headers: Headers) {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(match[1]);
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100),
        email: z.string().email("Invalid email address").max(320),
        password: z.string().min(6, "Password must be at least 6 characters").max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Check if email already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase().trim()))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists. Please sign in instead.",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 12);

      // Create user
      const result = await db
        .insert(users)
        .values({
          unionId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          name: input.name.trim(),
          email: input.email.toLowerCase().trim(),
          passwordHash,
          role: "user",
        })
        .returning();

      const user = result[0];

      // Sign JWT
      const token = signToken(user.id);

      // Set cookie
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(COOKIE_NAME, token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: env.isProduction,
          maxAge: COOKIE_MAX_AGE,
        })
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase().trim()))
        .limit(1);

      const user = result[0];

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      // Verify password
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      // Update last sign in
      await db
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      // Sign JWT
      const token = signToken(user.id);

      // Set cookie
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(COOKIE_NAME, token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: env.isProduction,
          maxAge: COOKIE_MAX_AGE,
        })
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const decoded = getLocalUserFromCookie(ctx.req.headers);
    if (!decoded) return null;

    const db = getDb();
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    return result[0] || null;
  }),

  logout: publicQuery.mutation(({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: env.isProduction,
        maxAge: 0,
      })
    );
    return { success: true };
  }),
});
