"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
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
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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

  useEffect(() => {
    (async () => {
      await Promise.all([loadDocs(), loadUsage()]);
      setReady(true);
    })();
  }, [loadDocs, loadUsage]);

  useEffect(() => {
    // Only auto-scroll to the newest message (never force the whole page).
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  /* ------------------------------ actions -------------------------------- */

  async function ingestFile(f: File) {
    setBusy(true);
    setStatus("Memproses dokumen…");
    try {
      const form = new FormData();
      form.append("file", f);
      const r = await fetch("/api/ingest", { method: "POST", body: form });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setStatus(`✓ ${j.filename} — ${j.pages} halaman siap`);
      setFile(null);
      await Promise.all([loadDocs(), loadUsage()]);
    } catch (e) {
      setStatus(`✗ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function upload() {
    if (!file) return;
    await ingestFile(file);
  }

  async function removeDoc(doc: Doc) {
    setDeletingId(doc.id);
    setStatus(`Menghapus ${doc.filename}…`);
    try {
      const r = await fetch(`/api/ingest?id=${doc.id}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setStatus(`✓ ${doc.filename} dihapus`);
      // If the deleted doc was the active filter, fall back to all documents.
      setActiveDoc((cur) => (cur === doc.id ? null : cur));
      await Promise.all([loadDocs(), loadUsage()]);
    } catch (e) {
      setStatus(`✗ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
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
  const confirmTarget =
    confirmId !== null ? docs.find((d) => d.id === confirmId) ?? null : null;

  return (
    <div
      className="relative mx-auto grid h-[calc(100vh-3.5rem)] max-w-6xl grid-cols-1 gap-0 lg:grid-cols-[320px_1fr]"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        if (!busy) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragging(false);
      }}
      onDrop={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(false);
        if (busy) return;
        const f = e.dataTransfer.files?.[0];
        if (f) void ingestFile(f);
      }}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center border-2 border-dashed border-accent bg-accent-soft/60">
          <p className="rounded-lg bg-surface px-4 py-2 text-sm font-medium text-ink">
            Lepaskan PDF untuk diunggah
          </p>
        </div>
      )}
      {/* ---------------------------- Sidebar ---------------------------- */}
      <aside className="hidden flex-col border-r border-line lg:flex">
        <div className="border-b border-line p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-heading-3 font-semibold text-ink">Dokumen</h2>
            <Badge tone="neutral">{docs.length}</Badge>
          </div>

          <label
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-line-strong bg-surface px-3 py-4 text-center transition-colors hover:border-accent hover:bg-accent-soft/40 ${
              busy ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <Icon name="upload" className="h-5 w-5 text-muted" />
            <span className="text-xs font-medium text-ink">
              {file ? file.name : "Unggah PDF"}
            </span>
            <span className="text-[11px] text-muted">
              {file ? "Siap diproses" : "Klik atau tarik berkas ke sini"}
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
          {busy && (
            <div
              className="mt-2 h-1 w-full overflow-hidden rounded-full bg-sunken"
              role="progressbar"
              aria-label="Memproses dokumen"
            >
              <span className="block h-full w-1/4 rounded-full bg-accent animate-progress" />
            </div>
          )}
          {status && (
            <p
              className={`mt-2 text-xs ${
                status.startsWith("✗")
                  ? "text-danger"
                  : status.startsWith("✓")
                    ? "text-positive"
                    : "text-muted"
              }`}
            >
              {status}
            </p>
          )}
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
                <li key={d.id} className="group relative">
                  <button
                    onClick={() => setActiveDoc(d.id)}
                    className={`flex w-full items-start gap-2 rounded-lg py-2 pl-3 pr-9 text-left text-sm transition-colors ${
                      activeDoc === d.id
                        ? "bg-accent-soft font-medium text-accent-hover"
                        : "text-muted hover:bg-sunken"
                    }`}
                  >
                    <Icon name="file" className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{d.filename}</span>
                      <span className="block text-body-sm text-muted">
                        {d.pages} hal · {d.chunks} bagian
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => setConfirmId(d.id)}
                    aria-label={`Hapus ${d.filename}`}
                    title="Hapus dokumen"
                    className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md text-muted opacity-0 transition-opacity hover:bg-danger-soft hover:text-danger focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-xs text-muted">
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
            aria-label="Pilih dokumen"
          >
            <option value="">Semua dokumen</option>
            {docs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.filename}
              </option>
            ))}
          </select>
          {activeDoc !== null && (
            <button
              onClick={() => {
                const d = docs.find((x) => x.id === activeDoc);
                if (d) setConfirmId(d.id);
              }}
              aria-label="Hapus dokumen ini"
              title="Hapus dokumen"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line-strong text-muted hover:bg-danger-soft hover:text-danger"
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          )}
          <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-line-strong bg-surface text-muted">
            <Icon name="upload" className="h-4 w-4" />
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void ingestFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {busy && (
          <div className="h-1 w-full overflow-hidden bg-sunken lg:hidden" role="progressbar" aria-label="Memproses dokumen">
            <span className="block h-full w-1/4 rounded-full bg-accent animate-progress" />
          </div>
        )}
        {status && (
          <p
            className={`border-b border-line bg-sunken px-3 py-2 text-xs lg:hidden ${
              status.startsWith("✗")
                ? "text-danger"
                : status.startsWith("✓")
                  ? "text-positive"
                  : "text-muted"
            }`}
          >
            {status}
          </p>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-[720px] pt-6">
              {hasDocs ? (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="font-heading text-heading-2 font-semibold text-ink">
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
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-accent-hover">
                    <Icon name="upload" className="h-4 w-4" />
                    Unggah PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void ingestFile(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </EmptyState>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-[720px] space-y-6">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-sunken px-4 py-2.5 text-sm text-ink">
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
                    <Icon name="search" className="h-3.5 w-3.5" />
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
          <div className="mx-auto flex max-w-[720px] items-end gap-2">
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
        </div>
      </section>

      {/* Shared delete confirmation — visible on every viewport, including
          mobile where the sidebar (and its list) is hidden. */}
      {confirmTarget && (
        <div
          className="absolute inset-0 z-30 grid place-items-center bg-ink/20 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus dokumen"
          onClick={() => deletingId === null && setConfirmId(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-heading-3 font-semibold text-ink">
              Hapus dokumen?
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              <span className="font-medium text-ink">{confirmTarget.filename}</span> akan
              dihapus beserta seluruh bagiannya. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmId(null)}
                disabled={deletingId !== null}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeDoc(confirmTarget)}
                disabled={deletingId !== null}
              >
                <Icon name="trash" className="h-4 w-4" />
                {deletingId === confirmTarget.id ? "Menghapus…" : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Answer block ------------------------------ */

/**
 * Render one line of answer text with inline markup: **bold**, `code`, and
 * citation markers, which become anchor links to the matching source card.
 * Citations may arrive as `[page 2]`, a bare `[1]`, or plain prose such as
 * "halaman 2" / "hlm. 2" / "page 2" — the model is not always literal. A prose
 * mention only becomes a link when that page is actually among the sources,
 * so incidental numbers are left untouched.
 */
function renderInline(text: string, cites: Citation[], anchor: string): ReactNode[] {
  const out: ReactNode[] = [];
  const token =
    /(\*\*[^*]+\*\*|`[^`]+`|\[page\s*\d+\]|\[\d+\]|(?:halaman|hlm\.?|page)\s*\d+)/gi;
  let cursor = 0;
  let seq = 0;
  let m: RegExpExecArray | null;
  while ((m = token.exec(text)) !== null) {
    if (m.index > cursor) out.push(text.slice(cursor, m.index));
    const t = m[0];
    if (t.startsWith("**")) {
      out.push(
        <strong key={`${anchor}-b${seq++}`} className="font-semibold">
          {t.slice(2, -2)}
        </strong>
      );
    } else if (t.startsWith("`")) {
      out.push(
        <code
          key={`${anchor}-c${seq++}`}
          className="rounded bg-sunken px-1 py-0.5 font-mono text-[0.85em]"
        >
          {t.slice(1, -1)}
        </code>
      );
    } else {
      // "[page N]" matches by page number; a bare "[N]" is a 1-based source
      // index; a prose mention ("halaman N") matches by page number.
      const bracket = /^\[(page\s*)?(\d+)\]$/i.exec(t);
      const word = /^(?:halaman|hlm\.?|page)\s*(\d+)$/i.exec(t);
      let idx = -1;
      if (bracket) {
        const n = Number(bracket[2]);
        idx = bracket[1]
          ? cites.findIndex((c) => c.page === n)
          : n >= 1 && n <= cites.length
            ? n - 1
            : -1;
      } else if (word) {
        const n = Number(word[1]);
        idx = cites.findIndex((c) => c.page === n);
      }
      if (idx < 0) {
        out.push(t);
      } else {
        out.push(
          <sup key={`${anchor}-r${seq++}`}>
            <a
              href={`#src-${anchor}-${idx + 1}`}
              title={`${cites[idx].filename} — hlm. ${cites[idx].page}`}
              className="mx-0.5 text-xs font-semibold text-accent hover:underline"
            >
              [{idx + 1}]
            </a>
          </sup>
        );
      }
    }
    cursor = m.index + t.length;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

/**
 * Lay out a full answer: blank-line-separated paragraphs, `-`/`*` bullets and
 * `1.` numbered items become real lists, and `#` headings get emphasis. The
 * model replies in Markdown, so without this the raw `**`/`-` leaked through.
 */
function AnswerBody({ msg }: { msg: Msg }) {
  const cites = msg.citations ?? [];
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;
  let seq = 0;

  const flush = () => {
    if (list.length === 0) return;
    const items = list;
    const Tag = ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`list-${seq++}`}
        className={`ml-4 space-y-1 ${ordered ? "list-decimal" : "list-disc"}`}
      >
        {items.map((it, i) => (
          <li key={i}>{renderInline(it, cites, msg.id)}</li>
        ))}
      </Tag>
    );
    list = [];
  };

  for (const raw of msg.text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    if (bullet) {
      if (list.length === 0) ordered = false;
      list.push(bullet[1]);
      continue;
    }
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      if (list.length === 0) ordered = true;
      list.push(numbered[1]);
      continue;
    }
    flush();
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    blocks.push(
      <p
        key={`p-${seq++}`}
        className={heading ? "font-semibold text-ink" : undefined}
      >
        {renderInline(heading ? heading[1] : line, cites, msg.id)}
      </p>
    );
  }
  flush();
  return <div className="space-y-2">{blocks}</div>;
}

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

  return (
    <div className="animate-fade-up">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-white">
          <Icon name="file" className="h-3.5 w-3.5" />
        </span>
        DocuAsk
        {msg.usedLlm === false && <Badge tone="neutral">tanpa LLM</Badge>}
      </div>

      <div className="rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink shadow-card">
        <AnswerBody msg={msg} />
      </div>

      {/* Source cards */}
      {cites.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-muted">
            Sumber ({cites.length})
          </p>
          {cites.map((c, i) => (
            <div
              key={i}
              id={`src-${msg.id}-${i + 1}`}
              className="scroll-mt-20 rounded-lg border border-line bg-surface px-3 py-2.5"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="grid h-4 w-4 place-items-center rounded-md bg-accent-soft text-xs font-semibold text-accent">
                  {i + 1}
                </span>
                <Icon name="file" className="h-3.5 w-3.5 text-muted" />
                <span className="truncate font-medium text-ink">{c.filename}</span>
                <span className="text-muted">hlm. {c.page}</span>
                <span className="ml-auto text-muted">{Math.round(c.score * 100)}%</span>
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
