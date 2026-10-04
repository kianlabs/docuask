/**
 * RAG core — retrieval + grounded answering with page citations.
 *
 * Two anti-hallucination layers (same philosophy as the `cv` repo):
 *   Layer 1 — retrieval floor: queries whose best score is below the floor are
 *             answered WITHOUT calling the LLM.
 *   Layer 2 — grounded system prompt: the model may only use the retrieved
 *             chunks; if the answer is not there, it must say so.
 *
 * All retrieval is scoped to a tenant id (enforced again by Postgres RLS).
 */

import { embed, activeProvider } from "./embed";
import { retrieve, RetrievedChunk } from "./store";
import { chat, llmConfig } from "./llm";

export interface Citation {
  filename: string;
  page: number;
  score: number;
  snippet: string;
}

export interface RagAnswer {
  answer: string;
  citations: Citation[];
  usedLlm: boolean;
  reason?: string;
  embedProvider?: string;
}

const SYSTEM_PROMPT = `You are DocuAsk, a document question-answering assistant.

RULES:
1. Answer ONLY from the RETRIEVED CONTEXT below. Never use outside knowledge.
2. Every factual sentence must be supported by the context. After a sentence
   that uses a source, cite it inline as [page N].
3. If the context does not contain the answer, reply exactly:
   "Maaf, informasi itu tidak ada di dalam dokumen." and nothing else.
4. Be concise and answer in the same language as the question.
5. Do not invent page numbers or quote text that is not in the context.`;

function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map(
      (c, i) => `[Sumber ${i + 1} — ${c.filename}, page ${c.page}]\n${c.text}`
    )
    .join("\n\n---\n\n");
}

export async function answerQuestion(
  tenantId: number,
  question: string,
  opts: { documentId?: number; k?: number } = {}
): Promise<RagAnswer> {
  const provider = activeProvider();
  const q = question.trim();
  if (!q)
    return { answer: "", citations: [], usedLlm: false, reason: "empty", embedProvider: provider };

  const { vectors } = await embed([q]);

  // Wrap retrieve in try/catch: embedding provider fallback or schema mismatch
  // could cause dimension errors. Degrade gracefully rather than 500.
  let chunks: RetrievedChunk[];
  try {
    chunks = await retrieve(tenantId, vectors[0], {
      documentId: opts.documentId,
      k: opts.k ?? 6,
      minScore: 0.12,
    });
  } catch (err) {
    console.error("[rag] retrieval failed; returning grounded refusal:", err);
    return {
      answer: "Maaf, informasi itu tidak ada di dalam dokumen.",
      citations: [],
      usedLlm: false,
      reason: "retrieval_error",
      embedProvider: provider,
    };
  }

  // Layer 1 — retrieval floor: nothing relevant -> do not call the LLM.
  if (chunks.length === 0) {
    return {
      answer: "Maaf, informasi itu tidak ada di dalam dokumen.",
      citations: [],
      usedLlm: false,
      reason: "below_retrieval_floor",
      embedProvider: provider,
    };
  }

  const citations: Citation[] = chunks.map((c) => ({
    filename: c.filename,
    page: c.page,
    score: Number(c.score.toFixed(4)),
    snippet: c.text.slice(0, 200),
  }));

  const cfg = llmConfig();
  if (!cfg.configured) {
    return {
      answer:
        "LLM belum dikonfigurasi (LLM_API_KEY kosong). Berikut sumber paling relevan yang ditemukan:",
      citations,
      usedLlm: false,
      reason: "llm_not_configured",
      embedProvider: provider,
    };
  }

  const userMsg = `RETRIEVED CONTEXT:\n\n${buildContext(
    chunks
  )}\n\n---\n\nQUESTION: ${q}`;

  const answer = await chat(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMsg },
    ],
    { temperature: 0.1, maxTokens: 800 }
  );

  return {
    answer: answer || "Maaf, informasi itu tidak ada di dalam dokumen.",
    citations,
    usedLlm: true,
    embedProvider: provider,
  };
}
