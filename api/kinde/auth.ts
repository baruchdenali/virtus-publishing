import { createKindeServerClient, GrantType, type SessionManager } from "@kinde-oss/kinde-typescript-sdk";

// Kinde server client for backend operations
const kindeDomain = process.env.KINDE_DOMAIN;
const kindeClientId = process.env.KINDE_CLIENT_ID;
const kindeClientSecret = process.env.KINDE_CLIENT_SECRET;

export const kindeClient = kindeDomain && kindeClientId && kindeClientSecret
  ? createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
      authDomain: kindeDomain,
      clientId: kindeClientId,
      clientSecret: kindeClientSecret,
      redirectURL: process.env.KINDE_REDIRECT_URI || `${kindeDomain}/api/callback`,
      logoutRedirectURL: process.env.KINDE_POST_LOGOUT_REDIRECT_URI || kindeDomain,
    })
  : null;

// In-memory session store (use Redis in production)
const sessionStore = new Map<string, Record<string, unknown>>();

export function createSessionManager(sessionId: string): SessionManager {
  const store = sessionStore;

  return {
    async getSessionItem(key: string) {
      return (store.get(sessionId)?.[key] as string) || null;
    },
    async setSessionItem(key: string, value: unknown) {
      const session = store.get(sessionId) || {};
      session[key] = value;
      store.set(sessionId, session);
    },
    async removeSessionItem(key: string) {
      const session = store.get(sessionId);
      if (session) delete session[key];
    },
    async destroySession() {
      store.delete(sessionId);
    },
  };
}

export function getSessionIdFromCookie(headers: Headers): string | null {
  const cookie = headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/kinde_session_id=([^;]+)/);
  return match ? match[1] : null;
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
