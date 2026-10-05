"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Alert, Button, Card, Dots, Icon, Input } from "@/components/ui";

/**
 * Landing demo: ask the sample documents a question without signing up.
 *
 * This owns its whole <section>, heading included, because the demo is opt-in
 * and fails closed: the endpoint is disabled without DEMO_TENANT_ID and without
 * the durable counter tables. It probes GET /api/demo for {enabled} and renders
 * nothing until it knows, so an unconfigured deploy shows no orphan heading.
 * Result content is rendered after mount and is deliberately NOT marked
 * `data-motion` — PageMotion only animates elements present at first render.
 */

interface DemoCitation {
  filename: string;
  page: number;
}

interface DemoResult {
  answer: string;
  usedLlm: boolean;
  citations: DemoCitation[];
}

const EXAMPLES = [
  "Berapa jatah cuti tahunan karyawan tetap?",
  "Berapa lama masa percobaan di kontrak kerja?",
  "Siapa yang menyetujui pengadaan di atas Rp 100 juta?",
];

// LLM refusals vary in wording, but they always lead with the refusal, so we
// test only the head of the answer and accept a range of phrasings.
const REFUSAL_RE =
  /tidak (tersedia|ada|dapat|ditemukan|ditemui|menyebutkan|disebutkan|membahas|mencakup|memuat|relevan|memiliki|tersirat)/i;

/** Render an answer: `**bold**` and `[page N]`/`[N]` markers become elements. */
function renderAnswer(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Split on bold or a page citation, keeping the delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|\[(?:page\s*)?\d+\])/gi);
  parts.forEach((p, i) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(p);
    const cite = /^\[(?:page\s*)?(\d+)\]$/i.exec(p);
    if (bold) {
      out.push(<strong key={i}>{bold[1]}</strong>);
    } else if (cite) {
      out.push(
        <sup key={i} className="text-xs font-semibold text-accent">
          [{cite[1]}]
        </sup>
      );
    } else if (p) {
      out.push(<span key={i}>{p}</span>);
    }
  });
  return out;
}

export function DemoAsk() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // null = still probing; false = unavailable (render nothing).
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/demo")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((j: { enabled?: boolean }) => {
        if (alive) setEnabled(j.enabled === true);
      })
      .catch(() => {
        if (alive) setEnabled(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function ask(q: string) {
    const text = q.trim();
    if (!text || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      if (res.status === 503) {
        setEnabled(false);
        return;
      }
      if (res.status === 429) {
        setError(
          "Batas demo sedang tercapai. Coba lagi nanti, atau daftar gratis untuk bertanya sepuasnya."
        );
        return;
      }
      const j = (await res.json()) as Partial<DemoResult> & { error?: string };
      if (!res.ok || typeof j.answer !== "string") {
        setError("Terjadi kesalahan. Coba lagi sebentar.");
        return;
      }
      setResult({
        answer: j.answer,
        usedLlm: j.usedLlm ?? false,
        citations: Array.isArray(j.citations) ? j.citations : [],
      });
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi sebentar.");
    } finally {
      setLoading(false);
    }
  }

  // Unknown or unavailable: render nothing at all (no orphan heading).
  if (enabled !== true) return null;

  const refused = result
    ? REFUSAL_RE.test(result.answer.slice(0, 160))
    : false;

  return (
    <section className="border-t border-line py-16">
      <h2
        className="font-heading text-center text-heading-2 font-semibold text-ink"
        data-motion
      >
        Coba tanpa daftar.
      </h2>
      <p
        className="mx-auto mt-2 max-w-xl text-center text-sm text-muted"
        data-motion
      >
        Tanya ke tiga dokumen contoh dan lihat jawaban bersitasinya. Tanpa akun,
        tanpa kartu.
      </p>

      <Card className="mt-10 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask(question);
            }}
            placeholder="Tulis pertanyaan, mis. berapa jatah cuti tahunan?"
            aria-label="Pertanyaan untuk dokumen contoh"
            maxLength={300}
            disabled={loading}
          />
          <Button
            onClick={() => ask(question)}
            disabled={loading || question.trim().length === 0}
            className="shrink-0"
          >
            {loading ? "Menjawab…" : "Tanya"}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Coba:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuestion(ex);
                ask(ex);
              }}
              disabled={loading}
              className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-5 flex items-center gap-2 text-sm text-muted">
            <Dots />
            Mencari di dokumen contoh…
          </div>
        )}

        {error && (
          <div className="mt-5">
            <Alert tone="warning">{error}</Alert>
          </div>
        )}

        {result && !loading && (
          <div className="mt-5 border-t border-line pt-5">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-accent text-white">
                <Icon name="file" className="h-3 w-3" />
              </span>
              DocuAsk
              {!result.usedLlm && (
                <span className="rounded border border-line px-1.5 py-0.5 text-body-sm">
                  tanpa LLM
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-ink">
              {renderAnswer(result.answer)}
            </p>
            {refused && (
              <p className="mt-2 text-xs text-muted">
                Ini perilaku yang kami janjikan: kalau jawabannya tidak ada,
                DocuAsk mengatakannya — bukan mengarang.
              </p>
            )}
            {!refused && result.citations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.citations.map((c, i) => (
                  <span
                    key={`${c.filename}-${c.page}-${i}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-xs text-muted"
                  >
                    <span className="font-medium text-accent">[{i + 1}]</span>
                    <Icon name="file" className="h-3.5 w-3.5" />
                    {c.filename} · hlm. {c.page}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="mt-5 text-xs text-muted">
          Pertanyaan demo tidak disimpan dan tidak terhubung ke akun. Dokumen
          yang dipakai adalah tiga contoh: kebijakan cuti, kontrak kerja, dan SOP
          pengadaan.
        </p>
      </Card>
    </section>
  );
}
