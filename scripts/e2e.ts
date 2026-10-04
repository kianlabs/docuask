/**
 * End-to-end RAG check without a browser.
 *   npx tsx scripts/e2e.ts <path-to.pdf> "question 1" ["question 2" ...]
 *
 * Env: API_KEY (tenant key, required), BASE (default :3005).
 */
import { readFileSync } from "node:fs";

const API_KEY = process.env.API_KEY || "";
const BASE = process.env.BASE || "http://127.0.0.1:3005";

async function main() {
  const [pdfPath, ...questions] = process.argv.slice(2);
  if (!pdfPath) {
    console.error("usage: tsx scripts/e2e.ts <pdf> \"q1\" [\"q2\" ...]");
    process.exit(1);
  }
  if (!API_KEY) {
    console.error("API_KEY env var is required (a tenant API key).");
    process.exit(1);
  }

  // Ingest via HTTP so we exercise the real route (auth + embed + store).
  const bytes = readFileSync(pdfPath);
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "application/pdf" }), pdfPath.split("/").pop()!);

  const ingest = await fetch(`${BASE}/api/ingest`, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: form,
  });
  const ing = (await ingest.json()) as Record<string, unknown>;
  console.log("INGEST:", JSON.stringify(ing));

  for (const q of questions) {
    const r = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    const a = (await r.json()) as {
      answer: string;
      usedLlm: boolean;
      reason?: string;
      citations?: Array<{ page: number; score: number }>;
    };
    console.log(`\nQ: ${q}`);
    console.log(`A: ${a.answer}`);
    console.log(
      `   usedLlm=${a.usedLlm} reason=${a.reason ?? "-"} cites=${JSON.stringify(
        (a.citations ?? []).map((c) => [c.page, c.score])
      )}`
    );
  }
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
