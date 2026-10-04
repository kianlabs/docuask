/**
 * PDF extraction + chunking.
 *
 * We extract text PER PAGE and keep the page number on every chunk, so the
 * answer can cite "page N". Chunks never cross a page boundary — a citation
 * must point at exactly one page.
 */

import { extractText, getDocumentProxy } from "unpdf";

export interface PageText {
  page: number; // 1-based
  text: string;
}

export async function pdfToPages(buffer: Uint8Array): Promise<PageText[]> {
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(text) ? text : [text];
  return pages.map((t, i) => ({
    page: i + 1,
    text: normalize(t),
  }));
}

function normalize(s: string): string {
  return s
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/-\n/g, "") // de-hyphenate line breaks
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface TextChunk {
  page: number;
  idx: number;
  text: string;
}

/**
 * Split one page's text into overlapping chunks by words.
 * ~180 words per chunk, 30-word overlap — tuned for retrieval precision
 * on prose PDFs. Chunks stay within a single page.
 */
export function chunkPage(
  page: PageText,
  opts: { targetWords?: number; overlapWords?: number } = {}
): TextChunk[] {
  const target = opts.targetWords ?? 180;
  const overlap = opts.overlapWords ?? 30;
  const words = page.text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: TextChunk[] = [];
  const step = Math.max(1, target - overlap);
  let idx = 0;
  for (let start = 0; start < words.length; start += step) {
    const slice = words.slice(start, start + target);
    if (slice.length === 0) break;
    chunks.push({ page: page.page, idx: idx++, text: slice.join(" ") });
    if (start + target >= words.length) break;
  }
  return chunks;
}

export function chunkPages(pages: PageText[]): TextChunk[] {
  return pages.flatMap((p) => chunkPage(p));
}
