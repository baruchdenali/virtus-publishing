import { eq } from "drizzle-orm";
import { users } from "@db/schema";
import type { User } from "@db/schema";
import { getDb } from "../queries/connection";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";

// In-memory session store (use Redis in production)
const sessions = new Map<string, { unionId: string; createdAt: number }>();

function generateSessionId(): string {
  return crypto.randomUUID();
}

function setSessionCookie(resHeaders: Headers, sessionId: string) {
  const options = getSessionCookieOptions(new Headers());
  let cookie = `session_id=${sessionId}; Path=${options.path}; SameSite=${options.sameSite}; Max-Age=${options.maxAge}`;
  if (options.httpOnly) cookie += "; HttpOnly";
  if (options.secure) cookie += "; Secure";
  resHeaders.append("Set-Cookie", cookie);
}

function clearSessionCookie(resHeaders: Headers) {
  resHeaders.append("Set-Cookie", "session_id=; Path=/; Max-Age=0; HttpOnly");
}

function getSessionId(headers: Headers): string | null {
  const cookie = headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/session_id=([^;]+)/);
  return match ? match[1] : null;
}

export async function authenticateRequest(headers: Headers): Promise<User | undefined> {
  const sessionId = getSessionId(headers);
  if (!sessionId) return undefined;

  const session = sessions.get(sessionId);
  if (!session) return undefined;

  // Check expiry (30 days)
  if (Date.now() - session.createdAt > 30 * 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return undefined;
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.unionId, session.unionId))
    .limit(1);

  return rows[0];
}

export function createOAuthCallbackHandler() {
  return async (c: any) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const resHeaders = new Headers();

    if (!code) {
      return c.json({ error: "Missing authorization code" }, 400);
    }

    try {
      // Exchange code for token with Kimi
      const tokenRes = await fetch(`${env.kimiAuthUrl}/api/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: env.appId,
          client_secret: env.appSecret,
          code,
          redirect_uri: `${c.req.url.split("/api/oauth/callback")[0]}/api/oauth/callback`,
        }),
      });

      if (!tokenRes.ok) {
        return c.json({ error: "Token exchange failed" }, 401);
      }

      const tokenData: any = await tokenRes.json();
      const accessToken = tokenData.access_token;
      const unionId = tokenData.union_id;

      if (!unionId) {
        return c.json({ error: "Invalid token response" }, 401);
      }

      // Get user info
      const userRes = await fetch(`${env.kimiOpenUrl}/api/oauth/user`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userData: any = userRes.ok ? await userRes.json() : {};
      const name = userData.name || userData.nickname || "User";
      const email = userData.email || null;
      const avatar = userData.avatar || null;

      // Upsert user
      const db = getDb();
      await db
        .insert(users)
        .values({
          unionId,
          name,
          email,
          avatar,
          role: unionId === env.ownerUnionId ? "admin" : "user",
        })
        .onConflictDoUpdate({
          target: users.unionId,
          set: { name, email, avatar, lastSignInAt: new Date() },
        });

      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, { unionId, createdAt: Date.now() });
      setSessionCookie(resHeaders, sessionId);

      // Redirect to home
      const redirectUrl = state ? atob(state) : "/";
      resHeaders.set("Location", redirectUrl);

      return new Response(null, { status: 302, headers: resHeaders });
    } catch (err) {
      console.error("OAuth callback error:", err);
      return c.json({ error: "Authentication failed" }, 500);
    }
  };
}

export function createLogoutHandler() {
  return async (c: any) => {
    const resHeaders = new Headers();
    const sessionId = getSessionId(c.req.raw.headers);
    if (sessionId) sessions.delete(sessionId);
    clearSessionCookie(resHeaders);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...Object.fromEntries(resHeaders), "Content-Type": "application/json" },
    });
  };
}
