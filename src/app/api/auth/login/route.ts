import { NextRequest, NextResponse } from "next/server";
import { findLoginByEmail, verifyLogin } from "@/lib/accounts";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, sessionsEnabled } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";
import { badRequest, serverError } from "@/lib/http";

export const runtime = "nodejs";

/**
 * POST /api/auth/login { email, password }
 * On success sets the session cookie. Always answers the same way on bad
 * credentials so the endpoint does not reveal which emails exist.
 */
export async function POST(req: NextRequest) {
  try {
    if (!sessionsEnabled()) {
      return serverError("auth.login", new Error("SESSION_SECRET/ADMIN_TOKEN not configured"), 503);
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = rateLimit(`login:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "too many attempts, slow down" },
        { status: 429, headers: { "retry-after": String(rl.retryAfter) } }
      );
    }

    const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
    if (!body?.email || !body?.password) return badRequest("email and password required");

    const login = await findLoginByEmail(body.email);
    const invalid = NextResponse.json({ ok: false, error: "invalid credentials" }, { status: 401 });
    if (!login || !login.isActive) return invalid;
    if (!verifyLogin(body.password, login.passwordHash)) return invalid;

    const token = createSessionToken(login.userId, login.tenantId);
    const res = NextResponse.json({ ok: true, tenantId: login.tenantId });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    return serverError("auth.login", err);
  }
}
