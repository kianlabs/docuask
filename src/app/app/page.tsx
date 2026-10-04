"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Dots,
  EmptyState,
  Icon,
  Input,
  QuotaBar,
} from "@/components/ui";

/* ------------------------------- types ----------------------------------- */

interface Citation {
  filename: string;
  page: number;
  score: number;
  snippet: string;
}

interface Doc {
  id: number;
  filename: string;
  pages: number;
  chunks: number;
  created_at: string;
}

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  usedLlm?: boolean;
  reason?: string;
  feedback?: "up" | "down";
}

interface Usage {
  documents: number;
  questions: number;
  plan: {
    code: string;
    name: string;
    max_documents: number | null;
    max_questions: number | null;
  };
  remainingDocuments: number | null;
  remainingQuestions: number | null;
}

interface Diag {
  embed?: { provider?: string; dims?: number };
  tenantName?: string;
  [k: string]: unknown;
}

const SAMPLE_QUESTIONS = [
  "Apa poin utama dokumen ini?",
  "Sebutkan kebijakan yang paling penting.",
  "Ringkas isinya dalam 3 poin.",
  "Apakah ada tenggat waktu yang disebutkan?",
];

/* ------------------------------- page ------------------------------------ */

export default function AppPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeDoc, setActiveDoc] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [diag, setDiag] = useState<Diag | null>(null);
  const [showDiag, setShowDiag] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* --------------------------- data loaders ------------------------------ */

  const loadDocs = useCallback(async () => {
    const r = await fetch("/api/ingest");
    if (r.status === 401) {
      router.replace("/login?next=/app");
      return;
    }
    const j = await r.json();
    setDocs(j.documents ?? []);
  }, [router]);

  const loadUsage = useCallback(async () => {
    const r = await fetch("/api/usage");
    if (r.ok) {
      const j = await r.json();
      setUsage(j.usage);
    }
  }, []);

  const loadDiag = useCallback(async () => {
    try {
      const r = await fetch("/api/chat");
      if (r.ok) setDiag(await r.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadDocs(), loadUsage(), loadDiag()]);
      setReady(true);
    })();
  }, [loadDocs, loadUsage, loadDiag]);

  useEffect(() => {
    // Only auto-scroll to the newest message (never force the whole page).
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  /* ------------------------------ actions -------------------------------- */

  async function upload() {
    if (!file) return;
    setBusy(true);
    setStatus("Memproses dokumen…");
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/ingest", { method: "POST", body: form });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setStatus(`✓ ${j.filename} — ${j.pages} halaman siap`);
      setFile(null);
      await Promise.all([loadDocs(), loadUsage(), loadDiag()]);
    } catch (e) {
      setStatus(`✗ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function ask(qOverride?: string) {
    const q = (qOverride ?? question).trim();
    if (!q || thinking) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setQuestion("");
    setThinking(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          ...(activeDoc ? { documentId: activeDoc } : {}),
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: j.answer,
          citations: j.citations,
          usedLlm: j.usedLlm,
          reason: j.reason,
        },
      ]);
      loadUsage();
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `Maaf, terjadi kesalahan: ${e instanceof Error ? e.message : e}`,
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function regenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      // Drop the last assistant answer, then ask again.
      setMessages((m) => {
        const idx = m.map((x) => x.role).lastIndexOf("assistant");
        return idx >= 0 ? m.slice(0, idx) : m;
      });
      ask(lastUser.text);
    }
  }

  function copy(text: string, id: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
    });
  }

  function feedback(id: string, value: "up" | "down") {
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, feedback: value } : x)));
  }

  /* ------------------------------- render -------------------------------- */

  if (!ready) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] place-items-center">
        <Dots />
      </div>
    );
  }

  const hasDocs = docs.length > 0;

  return (
    <div className="mx-auto grid h-[calc(100vh-3.5rem)] max-w-6xl grid-cols-1 gap-0 lg:grid-cols-[320px_1fr]">
      {/* ---------------------------- Sidebar ---------------------------- */}
      <aside className="hidden flex-col border-r border-line lg:flex">
        <div className="border-b border-line p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Dokumen</h2>
            <Badge tone="neutral">{docs.length}</Badge>
          </div>

          <label
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-line-strong bg-surface px-3 py-4 text-center transition-colors hover:border-accent hover:bg-accent-soft/40 ${
              busy ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <Icon name="upload" className="h-5 w-5 text-muted" />
            <span className="text-xs text-muted">
              {file ? file.name : "Unggah PDF"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
          {file && (
            <Button size="sm" className="mt-2 w-full" onClick={upload} disabled={busy}>
              {busy ? "Memproses…" : "Proses berkas"}
            </Button>
          )}
          {status && <p className="mt-2 text-xs text-muted">{status}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {hasDocs ? (
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveDoc(null)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeDoc === null
                      ? "bg-accent-soft font-medium text-accent-hover"
                      : "text-muted hover:bg-sunken"
                  }`}
                >
                  Semua dokumen
                </button>
              </li>
              {docs.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => setActiveDoc(d.id)}
                    className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      activeDoc === d.id
                        ? "bg-accent-soft font-medium text-accent-hover"
                        : "text-muted hover:bg-sunken"
                    }`}
                  >
                    <Icon name="file" className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{d.filename}</span>
                      <span className="block text-[11px] text-faint">
                        {d.pages} hal · {d.chunks} bagian
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-xs text-faint">
              Belum ada dokumen. Unggah PDF untuk mulai.
            </p>
          )}
        </div>

        {usage && (
          <div className="space-y-3 border-t border-line p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">Paket</span>
              <Badge tone="accent">{usage.plan.name}</Badge>
            </div>
            <QuotaBar label="Dokumen" used={usage.documents} max={usage.plan.max_documents} />
            <QuotaBar label="Pertanyaan" used={usage.questions} max={usage.plan.max_questions} />
          </div>
        )}
      </aside>

      {/* ----------------------------- Chat ------------------------------ */}
      <section className="flex min-h-0 flex-col">
        {/* Mobile doc picker */}
        <div className="flex items-center gap-2 border-b border-line p-3 lg:hidden">
          <select
            value={activeDoc ?? ""}
            onChange={(e) => setActiveDoc(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-sm"
          >
            <option value="">Semua dokumen</option>
            {docs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.filename}
              </option>
            ))}
          </select>
          <label className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm text-muted">
            <Icon name="upload" className="h-4 w-4" />
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  // Upload immediately on mobile.
                  const form = new FormData();
                  form.append("file", f);
                  setBusy(true);
                  try {
                    const r = await fetch("/api/ingest", { method: "POST", body: form });
                    if (r.ok) await Promise.all([loadDocs(), loadUsage()]);
                  } finally {
                    setBusy(false);
                    setFile(null);
                  }
                }
              }}
            />
          </label>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-2xl pt-6">
              {hasDocs ? (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-lg font-semibold text-ink">
                      Tanya apa pun tentang dokumenmu
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Jawaban akan disertai sitasi halaman sumbernya.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SAMPLE_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => ask(q)}
                        className="rounded-lg border border-line bg-surface px-4 py-3 text-left text-sm text-muted transition-colors hover:border-accent-ring hover:bg-accent-soft/40 hover:text-ink"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<Icon name="file" className="h-7 w-7" />}
                  title="Mulai dengan mengunggah dokumen"
                  description="Tarik PDF ke panel kiri (atau tombol unggah di ponsel). Setelah itu kamu bisa langsung bertanya."
                >
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
                    <Icon name="upload" className="h-4 w-4" />
                    Unggah PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </EmptyState>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-6">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm text-white">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <Answer
                    key={m.id}
                    msg={m}
                    copied={copied === m.id}
                    onCopy={() => copy(m.text, m.id)}
                    onFeedback={(v) => feedback(m.id, v)}
                  />
                )
              )}
              {thinking && (
                <div className="flex items-center gap-3 text-sm text-muted">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-white">
                    <Icon name="spark" className="h-3.5 w-3.5" />
                  </span>
                  <span>Mencari di dokumen</span>
                  <Dots />
                </div>
              )}
              {messages.length > 0 && !thinking && (
                <div className="flex justify-center pt-1">
                  <Button variant="ghost" size="sm" onClick={regenerate}>
                    <Icon name="refresh" className="h-4 w-4" />
                    Buat ulang jawaban
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-line bg-surface/60 px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
              placeholder={
                hasDocs ? "Tanya apa pun tentang dokumen…" : "Unggah dokumen dulu untuk bertanya"
              }
              disabled={!hasDocs}
              aria-label="Pertanyaan"
            />
            <Button
              onClick={() => ask()}
              disabled={thinking || !question.trim() || !hasDocs}
              aria-label="Kirim"
            >
              <Icon name="send" className="h-4 w-4" />
            </Button>
          </div>

          {/* Diagnostics — hidden by default */}
          <div className="mx-auto mt-2 flex max-w-2xl items-center justify-between">
            <button
              onClick={() => setShowDiag((v) => !v)}
              className="text-[11px] text-faint hover:text-muted"
            >
              {showDiag ? "Sembunyikan diagnostik" : "Diagnostik"}
            </button>
            {showDiag && diag && (
              <p className="font-mono text-[11px] text-faint">
                embed: {diag.embed?.provider ?? "?"}
                {diag.embed?.dims ? ` (${diag.embed.dims}d)` : ""} · tenant:{" "}
                {diag.tenantName ?? "—"}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ----------------------------- Answer block ------------------------------ */

function Answer({
  msg,
  copied,
  onCopy,
  onFeedback,
}: {
  msg: Msg;
  copied: boolean;
  onCopy: () => void;
  onFeedback: (v: "up" | "down") => void;
}) {
  const cites = msg.citations ?? [];
  // The model cites inline as "[page N]"; also accept a bare "[N]".
  const parts = msg.text.split(/(\[page\s*\d+\]|\[\d+\])/gi);

  return (
    <div className="animate-fade-up">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-white">
          <Icon name="spark" className="h-3.5 w-3.5" />
        </span>
        DocuAsk
        {msg.usedLlm === false && <Badge tone="neutral">tanpa LLM</Badge>}
      </div>

      <div className="rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink shadow-card">
        <p className="whitespace-pre-wrap">
          {parts.map((p, i) => {
            const m = /^\[(page\s*)?(\d+)\]$/i.exec(p);
            if (!m) return <span key={i}>{p}</span>;
            const n = Number(m[2]);
            // "[page N]" matches by page; a bare "[N]" is a 1-based source index.
            const cardIdx = m[1]
              ? cites.findIndex((c) => c.page === n)
              : n >= 1 && n <= cites.length
                ? n - 1
                : -1;
            if (cardIdx < 0) return <span key={i}>{p}</span>;
            return (
              <sup key={i}>
                <a
                  href={`#src-${msg.id}-${cardIdx + 1}`}
                  title={`${cites[cardIdx].filename} — hlm. ${cites[cardIdx].page}`}
                  className="mx-0.5 font-medium text-accent hover:underline"
                >
                  [{cardIdx + 1}]
                </a>
              </sup>
            );
          })}
        </p>
      </div>

      {/* Source cards */}
      {cites.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-faint">
            Sumber ({cites.length})
          </p>
          {cites.map((c, i) => (
            <div
              key={i}
              id={`src-${msg.id}-${i + 1}`}
              className="scroll-mt-20 rounded-lg border border-line bg-surface px-3 py-2.5"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="grid h-4 w-4 place-items-center rounded bg-accent-soft text-[10px] font-semibold text-accent-hover">
                  {i + 1}
                </span>
                <Icon name="file" className="h-3.5 w-3.5 text-faint" />
                <span className="truncate font-medium text-ink">{c.filename}</span>
                <span className="text-faint">hlm. {c.page}</span>
                <span className="ml-auto text-faint">{Math.round(c.score * 100)}%</span>
              </div>
              <p className="mt-1.5 line-clamp-3 text-xs text-muted">{c.snippet}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-2 flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onCopy}>
          {copied ? (
            <>
              <Icon name="check" className="h-4 w-4 text-positive" /> Tersalin
            </>
          ) : (
            <>
              <Icon name="copy" className="h-4 w-4" /> Salin
            </>
          )}
        </Button>
        <span className="mx-1 h-4 w-px bg-line" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFeedback("up")}
          className={msg.feedback === "up" ? "text-positive" : ""}
          aria-label="Jawaban membantu"
        >
          👍
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFeedback("down")}
          className={msg.feedback === "down" ? "text-danger" : ""}
          aria-label="Jawaban kurang tepat"
        >
          👎
        </Button>
      </div>
    </div>
  );
}
