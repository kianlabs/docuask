import { timingSafeEqual } from "node:crypto";

/**
 * SECURITY: there is no user-login system in this MVP, so admin access is
 * gated by a shared secret in the `x-admin-token` header (ADMIN_TOKEN env).
 * In production this MUST become an authenticated admin role. If ADMIN_TOKEN
 * is unset, every request is rejected — fail closed.
 */
function isAdmin(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const got = req.headers.get("x-admin-token");
  if (!got) return false;
  // Constant-time comparison so the response time does not leak the token
  // byte-by-byte. Length is not secret; the early return on mismatch is fine.
  const a = Buffer.from(got, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { isAdmin };
