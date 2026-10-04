/**
 * Password hashing — scrypt (Node built-in, no dependency).
 *
 * Stored format (single TEXT column, self-describing so parameters can evolve):
 *   scrypt$N$r$p$<salt-hex>$<hash-hex>
 *
 * scrypt is memory-hard and tuned here to ~16 MB / hash, which is fine for a
 * login endpoint but deliberately NOT applied on a hot path.
 */

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const N = 16384; // CPU/memory cost (2^14)
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const derived = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = Buffer.from(parts[4], "hex");
  const expected = Buffer.from(parts[5], "hex");
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  if (salt.length === 0 || expected.length === 0) return false;
  const actual = scryptSync(password, salt, expected.length, { N: n, r, p });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
