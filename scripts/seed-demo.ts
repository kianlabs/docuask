/**
 * Seed the public demo tenant.
 *
 *   npx tsx scripts/seed-demo.ts
 *
 * Creates (idempotently) a tenant named `demo:public` and ingests three sample
 * documents from `samples/library/`: the HR leave policy, the employment
 * contract, and the procurement SOP. Embeddings are computed with whatever
 * provider the env selects (the offline `hash` provider needs no credentials).
 *
 * Prints `DEMO_TENANT_ID=<id>` on success — put that in .env.local to enable
 * the public demo (see src/app/api/demo/route.ts; unset = demo disabled).
 *
 * Safe to re-run: it reuses the existing demo tenant and skips a file whose
 * name is already present, so it never duplicates documents.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pdfToPages, chunkPages } from "../src/lib/pdf";
import { embed } from "../src/lib/embed";
import {
  pool,
  createTenant,
  insertDocument,
  listDocuments,
} from "../src/lib/store";

const DEMO_NAME = "demo:public";
const DEMO_KEY = "demo-public-key-not-for-api-use";
const SAMPLES = [
  "01-kebijakan-cuti-benefit.pdf",
  "04-kontrak-kerja-karyawan-tetap.pdf",
  "06-sop-pengadaan-barang-jasa.pdf",
];

async function main() {
  const existing = await pool().query<{ id: number }>(
    `SELECT id FROM tenants WHERE name = $1 ORDER BY id LIMIT 1`,
    [DEMO_NAME]
  );
  const tenant =
    existing.rows[0] ?? (await createTenant(DEMO_NAME, DEMO_KEY));
  const tenantId = tenant.id;

  const already = new Set((await listDocuments(tenantId)).map((d) => d.filename));

  for (const name of SAMPLES) {
    if (already.has(name)) {
      console.log(`skip (already ingested): ${name}`);
      continue;
    }
    const buffer = new Uint8Array(
      readFileSync(join(process.cwd(), "samples", "library", name))
    );
    const pages = await pdfToPages(buffer);
    const chunks = chunkPages(pages).filter((c) => c.text.length > 20);
    if (chunks.length === 0) {
      console.error(`no extractable text in ${name}; skipping`);
      continue;
    }
    const { vectors, model } = await embed(chunks.map((c) => c.text));
    const withVectors = chunks.map((c, i) => ({ ...c, vector: vectors[i] }));
    const id = await insertDocument(
      tenantId,
      name,
      pages.length,
      withVectors,
      model
    );
    console.log(`ingested ${name} -> document ${id} (${chunks.length} chunks)`);
  }

  console.log(`\nDEMO_TENANT_ID=${tenantId}`);
  await pool().end();
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
