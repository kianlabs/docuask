"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Alert, Button, Card, Dots, Icon, Input, LinkButton } from "@/components/ui";
import { CitationModal } from "@/components/CitationModal";

/**
 * Landing demo: ask the sample documents a question without signing up.
 *
 * The landing page owns the <section>, heading, and intro copy so they are
 * always in the server HTML for crawlers. This component owns only the
 * interactive card and degrades gracefully: while probing GET /api/demo it
 * renders nothing (the heading above already carries the section), and when
 * the demo is disabled it shows a calm fallback with a signup CTA.
 * Result content is rendered after mount and is deliberately NOT marked
 * `data-motion` — PageMotion only animates elements present at first render.
 */

interface DemoCitation {
  filename: string;
  page: number;
  snippet?: string;
  score?: number;
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
function renderAnswer(
  text: string,
  citations: DemoCitation[],
  onOpenCitation?: (c: DemoCitation, idx: number, all: DemoCitation[]) => void
): ReactNode[] {
  const out: ReactNode[] = [];
  // Split on bold or a page citation, keeping the delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|\[(?:page\s*)?\d+\])/gi);
  parts.forEach((p, i) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(p);
    const cite = /^\[(?:page\s*)?(\d+)\]$/i.exec(p);
    if (bold) {
      out.push(<strong key={i}>{bold[1]}</strong>);
    } else if (cite) {
      const num = Number(cite[1]);
      const idxByPage = citations.findIndex((c) => c.page === num);
      const matchIdx =
        idxByPage >= 0
          ? idxByPage
          : num >= 1 && num <= citations.length
          ? num - 1
          : -1;
      const target = matchIdx >= 0 ? citations[matchIdx] : null;

      if (target && onOpenCitation) {
        out.push(
          <button
            key={i}
            type="button"
            onClick={() => onOpenCitation(target, matchIdx, citations)}
            className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-md border border-amber-300 bg-amber-50/90 text-amber-900 hover:bg-amber-100 hover:border-amber-400 hover:shadow-xs transition-all text-xs font-semibold cursor-pointer align-baseline focus:outline-none focus:ring-2 focus:ring-amber-400"
            title={`${target.filename} — hlm. ${target.page}. Klik untuk melihat kutipan sumber.`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>hlm. {target.page}</span>
            <span className="text-[10px] font-mono text-amber-700/80">
              [{matchIdx + 1}]
            </span>
          </button>
        );
      } else {
        out.push(
          <sup key={i} className="text-xs font-semibold text-amber-800 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
            [{cite[1]}]
          </sup>
        );
      }
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
  const [activeCitation, setActiveCitation] = useState<{
    citation: DemoCitation;
    allCitations: DemoCitation[];
    currentIndex: number;
  } | null>(null);
  // null = still probing (render nothing); false = unavailable (fallback card).
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

  // While probing, render nothing: the static heading above already fills the
  // section, so there is no orphan. When disabled, show a calm fallback CTA.
  if (enabled === null) return null;

  const refused = result
    ? REFUSAL_RE.test(result.answer.slice(0, 160))
    : false;

  if (enabled === false) {
    return (
      <Card className="mt-10 p-5 text-center sm:p-6">
        <p className="text-sm text-muted">
          Demo langsung sedang tidak tersedia. Daftar gratis untuk mencoba
          DocuAsk dengan dokumenmu sendiri.
        </p>
        <LinkButton href="/signup" className="mt-4">
          Daftar gratis
        </LinkButton>
      </Card>
    );
  }

  return (
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
            {renderAnswer(result.answer, result.citations, (c, idx, all) => {
              setActiveCitation({ citation: c, allCitations: all, currentIndex: idx });
            })}
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
                <button
                  key={`${c.filename}-${c.page}-${i}`}
                  type="button"
                  onClick={() => {
                    setActiveCitation({
                      citation: c,
                      allCitations: result.citations,
                      currentIndex: i,
                    });
                  }}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/60 hover:bg-amber-100/80 hover:border-amber-300 px-2.5 py-1 text-xs text-ink transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  title="Klik untuk melihat potongan teks sumber dan menyalin kutipan"
                >
                  <span className="grid h-4 w-4 place-items-center rounded bg-amber-200 text-[10px] font-bold text-amber-900">
                    {i + 1}
                  </span>
                  <Icon name="file" className="h-3.5 w-3.5 text-muted group-hover:text-amber-800" />
                  <span className="font-medium text-ink">{c.filename}</span>
                  <span className="text-amber-800 font-medium">· hlm. {c.page}</span>
                  <span className="text-[11px] font-semibold text-amber-700 ml-0.5 opacity-80 group-hover:opacity-100">
                    Lihat Kutipan →
                  </span>
                </button>
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

      {/* Citation modal for demo viewer */}
      <CitationModal
        isOpen={activeCitation !== null}
        onClose={() => setActiveCitation(null)}
        citation={
          activeCitation
            ? {
                filename: activeCitation.citation.filename,
                page: activeCitation.citation.page,
                snippet:
                  activeCitation.citation.snippet ??
                  "Potongan teks dari dokumen contoh DocuAsk.",
                score: activeCitation.citation.score,
              }
            : null
        }
        allCitations={activeCitation?.allCitations.map((c) => ({
          filename: c.filename,
          page: c.page,
          snippet: c.snippet ?? "Potongan teks dari dokumen contoh DocuAsk.",
          score: c.score,
        }))}
        currentIndex={activeCitation?.currentIndex}
        onSelectCitation={(idx) => {
          if (activeCitation && activeCitation.allCitations[idx]) {
            setActiveCitation({
              citation: activeCitation.allCitations[idx],
              allCitations: activeCitation.allCitations,
              currentIndex: idx,
            });
          }
        }}
      />
    </Card>
  );
}
