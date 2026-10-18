"use client";

import { useEffect, useState } from "react";
import { Button, Icon } from "@/components/ui";

export interface CitationItem {
  filename: string;
  page: number;
  snippet: string;
  score?: number;
}

export interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  citation: CitationItem | null;
  allCitations?: CitationItem[];
  currentIndex?: number;
  onSelectCitation?: (index: number) => void;
}

export function CitationModal({
  isOpen,
  onClose,
  citation,
  allCitations,
  currentIndex = 0,
  onSelectCitation,
}: CitationModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (allCitations && allCitations.length > 1 && onSelectCitation) {
        if (e.key === "ArrowLeft" && currentIndex > 0) {
          onSelectCitation(currentIndex - 1);
        } else if (e.key === "ArrowRight" && currentIndex < allCitations.length - 1) {
          onSelectCitation(currentIndex + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, allCitations, currentIndex, onSelectCitation]);

  // Reset copy feedback when citation changes
  useEffect(() => {
    setCopied(false);
    setCopiedRaw(false);
  }, [citation]);

  if (!isOpen || !citation) return null;

  const total = allCitations?.length ?? 1;
  const hasMultiple = total > 1 && onSelectCitation !== undefined;
  const snippetText = citation.snippet?.trim() || "Potongan teks dari halaman ini tercatat sebagai referensi jawaban.";

  const handleCopyFormatted = async () => {
    const text = `"${snippetText}"\n\n— Sumber: ${citation.filename}, Hlm. ${citation.page}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyRawSnippet = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(snippetText);
      }
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-xs p-0 sm:p-4 animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="citation-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-line bg-surface shadow-pop overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong sm:hidden shrink-0" />

        {/* Elegant Golden Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shrink-0" />

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-line">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-300/80 shadow-xs">
                <Icon name="bookOpen" className="h-3.5 w-3.5 text-amber-700" />
                <span>Halaman {citation.page}</span>
              </span>

              {hasMultiple && (
                <span className="rounded-full bg-sunken px-2.5 py-1 text-xs font-medium text-muted">
                  Sumber {currentIndex + 1} dari {total}
                </span>
              )}

              {typeof citation.score === "number" && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                  {Math.round(citation.score * 100)}% Relevansi
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted hover:bg-sunken hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Tutup sitasi"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          <h3
            id="citation-title"
            className="mt-2.5 font-heading text-sm sm:text-base font-semibold text-ink flex items-center gap-2 truncate"
          >
            <Icon name="file" className="h-4 w-4 shrink-0 text-accent" />
            <span className="truncate" title={citation.filename}>
              {citation.filename}
            </span>
          </h3>
        </div>

        {/* Multi-citation Tabs / Pill strip */}
        {hasMultiple && allCitations && (
          <div className="flex items-center gap-1.5 px-5 py-2 border-b border-line bg-canvas/70 overflow-x-auto text-xs shrink-0">
            <span className="text-[11px] font-medium text-muted mr-1 shrink-0">
              Semua Sitasi:
            </span>
            {allCitations.map((c, idx) => (
              <button
                key={`${c.filename}-${c.page}-${idx}`}
                type="button"
                onClick={() => onSelectCitation(idx)}
                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
                  idx === currentIndex
                    ? "bg-amber-100 text-amber-900 border border-amber-400 font-semibold shadow-xs"
                    : "bg-surface text-muted border border-line hover:border-line-strong hover:text-ink"
                }`}
              >
                <span className="font-semibold text-amber-700">[{idx + 1}]</span>
                <span>hlm. {c.page}</span>
              </button>
            ))}
          </div>
        )}

        {/* Excerpt Body with elegant gold/amber styling */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="rounded-xl border border-amber-300/80 bg-gradient-to-b from-amber-50/90 via-amber-50/50 to-amber-100/20 p-4 sm:p-5 shadow-inner relative overflow-hidden">
            {/* Subtle decorative quote watermark */}
            <div className="absolute right-3 top-2 text-amber-400/15 pointer-events-none select-none">
              <Icon name="quote" className="h-16 w-16" />
            </div>

            <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Potongan Teks Sumber (Source Excerpt)</span>
              </div>
              <span className="text-[11px] font-medium text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded-full border border-amber-300/60">
                Tervalidasi di Dokumen
              </span>
            </div>

            {/* Blockquote with thick gold accent border */}
            <blockquote className="relative z-10 border-l-4 border-amber-500 pl-3.5 sm:pl-4 text-sm sm:text-[14.5px] leading-relaxed text-ink/90 font-sans italic selection:bg-amber-200">
              “{snippetText}”
            </blockquote>
          </div>

          {/* Source meta context */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted px-1">
            <span className="flex items-center gap-1.5 truncate">
              <Icon name="file" className="h-3.5 w-3.5 text-muted shrink-0" />
              <span className="truncate">
                Dokumen: <strong className="font-medium text-ink">{citation.filename}</strong>
              </span>
            </span>
            <span className="shrink-0">
              Nomor Halaman: <strong className="font-semibold text-amber-800">hlm. {citation.page}</strong>
            </span>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="border-t border-line bg-canvas/40 px-5 py-3 flex items-center justify-between gap-3 shrink-0">
          {/* Previous / Next buttons if multiple */}
          <div className="flex items-center gap-1">
            {hasMultiple && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectCitation(currentIndex - 1)}
                  disabled={currentIndex <= 0}
                  aria-label="Sitasi sebelumnya"
                  title="Sitasi sebelumnya (Panah Kiri)"
                >
                  <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectCitation(currentIndex + 1)}
                  disabled={currentIndex >= total - 1}
                  aria-label="Sitasi berikutnya"
                  title="Sitasi berikutnya (Panah Kanan)"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <Icon name="chevronRight" className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyRawSnippet}
              className="text-xs text-muted hover:text-ink hidden sm:inline-flex"
              title="Salin teks kutipan tanpa atribusi"
            >
              {copiedRaw ? (
                <>
                  <Icon name="check" className="h-3.5 w-3.5 text-positive" />
                  Tersalin
                </>
              ) : (
                <>
                  <Icon name="copy" className="h-3.5 w-3.5" />
                  Teks Saja
                </>
              )}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyFormatted}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition-all focus:ring-amber-400"
            >
              {copied ? (
                <>
                  <Icon name="check" className="h-4 w-4" />
                  Kutipan Tersalin!
                </>
              ) : (
                <>
                  <Icon name="copy" className="h-4 w-4" />
                  Salin Kutipan
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
