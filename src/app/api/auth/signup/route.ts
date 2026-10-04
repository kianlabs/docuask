import { NextRequest, NextResponse } from "next/server";
import { createAccount, findLoginByEmail } from "@/lib/accounts";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, sessionsEnabled } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";
import { badRequest, serverError } from "@/lib/http";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/**
 * POST /api/auth/signup { email, password }
 * Creates a tenant + owner user, starts a session, and returns the API key
 * ONCE (it is also visible later on the /account dashboard).
 */
export async function POST(req: NextRequest) {
  try {
    if (!sessionsEnabled()) {
      return serverError("auth.signup", new Error("SESSION_SECRET/ADMIN_TOKEN not configured"), 503);
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = rateLimit(`signup:${ip}`, 5, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "too many attempts, slow down" },
        { status: 429, headers: { "retry-after": String(rl.retryAfter) } }
      );
    }

    const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
    if (!body?.email || !body?.password) return badRequest("email and password required");
    if (!EMAIL_RE.test(body.email)) return badRequest("invalid email");
    if (body.password.length < MIN_PASSWORD) {
      return badRequest(`password must be at least ${MIN_PASSWORD} characters`);
    }

    const existing = await findLoginByEmail(body.email);
    if (existing) return badRequest("email already registered");

    const created = await createAccount(body.email, body.password);
    const token = createSessionToken(created.userId, created.tenantId);
    const res = NextResponse.json({
      ok: true,
      tenantId: created.tenantId,
      apiKey: created.apiKey,
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    return serverError("auth.signup", err);
  }
}
