/**
 * Session cookie — stateless, HMAC-signed (no server-side session store).
 *
 * Token format:  <userId>.<tenantId>.<expUnix>.<hmac-base64url>
 * The signature covers the whole payload, so the ids cannot be tampered with.
 * There is no user-login table to invalidate; rotating SESSION_SECRET logs
 * everyone out, which is an acceptable MVP trade-off.
 *
 * SECRET: SESSION_SECRET (falls back to ADMIN_TOKEN so a single-secret deploy
 * still works). If neither is set, sessions are disabled (fail closed).
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "docuask_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionData {
  userId: number;
  tenantId: number;
}

function secret(): string | null {
  return process.env.SESSION_SECRET || process.env.ADMIN_TOKEN || null;
}

/** Whether sessions can be used at all (a secret is configured). */
export function sessionsEnabled(): boolean {
  return secret() !== null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createSessionToken(userId: number, tenantId: number): string {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET (or ADMIN_TOKEN) must be set to issue sessions");
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${userId}.${tenantId}.${exp}`;
  return `${payload}.${sign(payload, key)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionData | null {
  const key = secret();
  if (!key || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [rawUser, rawTenant, rawExp, sig] = parts;
  const payload = `${rawUser}.${rawTenant}.${rawExp}`;
  const expected = sign(payload, key);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const exp = Number(rawExp);
  if (!Number.isInteger(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  const userId = Number(rawUser);
  const tenantId = Number(rawTenant);
  if (!Number.isInteger(userId) || !Number.isInteger(tenantId)) return null;
  return { userId, tenantId };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/** Resolve the session carried by a request's cookies, if any. */
export function getSessionFromRequest(req: {
  cookies: { get(name: string): { value: string } | undefined };
}): SessionData | null {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}
