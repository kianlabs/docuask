/**
 * Auth — resolve the calling tenant from an API key.
 *
 * Key is read from the `x-api-key` header, or `Authorization: Bearer <key>`.
 * In development (DOCUASK_DEV_TENANT set) a default tenant is used so the UI
 * works without juggling keys.
 */

import { NextRequest } from "next/server";
import { getOrCreateTenantByApiKey, createTenant, TenantRow } from "./store";

export function extractApiKey(req: NextRequest): string | null {
  const header = req.headers.get("x-api-key");
  if (header) return header.trim();
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

export interface AuthResult {
  tenant: TenantRow | null;
  error?: string;
  status?: number;
}

/**
 * Resolve the tenant for this request.
 * - If an API key is present, it must match an active tenant.
 * - If DOCUASK_DEV_TENANT_KEYS contains the key, create the tenant on first use.
 * - Otherwise 401.
 */
export async function authenticate(req: NextRequest): Promise<AuthResult> {
  const key = extractApiKey(req);
  if (!key) {
    return { tenant: null, error: "missing API key", status: 401 };
  }
  const tenant = await getOrCreateTenantByApiKey(key);
  if (tenant) return { tenant };

  // Auto-provision only keys explicitly listed in the dev allowlist.
  const allow = (process.env.DOCUASK_DEV_TENANT_KEYS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allow.includes(key)) {
    const created = await createTenant(`auto:${key.slice(0, 6)}`, key);
    return { tenant: created };
  }
  return { tenant: null, error: "invalid API key", status: 401 };
}
