import type { ReactNode } from "react";
import { SITE } from "@/lib/site";

/**
 * Shared shell for the legal pages (Privacy, Terms). One source for the heading
 * typography, the "last updated" line, and the prose rhythm so both documents
 * stay visually identical and easy to keep in sync.
 */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16">
      <div data-motion>
        <h1 className="font-heading text-heading-1 font-bold text-ink">{title}</h1>
        <p className="mt-2 text-xs text-muted">Terakhir diperbarui: {updated}</p>
        <p className="mt-6 text-sm leading-relaxed text-muted">{intro}</p>
      </div>
      <div className="mt-10 space-y-8">{children}</div>
      <p className="mt-12 border-t border-line pt-6 text-xs text-muted">
        Ada pertanyaan soal dokumen ini? Hubungi{" "}
        <a href={`mailto:${SITE.email}`} className="text-accent hover:text-accent-hover">
          {SITE.email}
        </a>
        .
      </p>
    </div>
  );
}

/** One numbered section: heading + body. */
export function LegalSection({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section data-motion>
      <h2 className="font-heading text-heading-3 font-semibold text-ink">
        {n}. {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

/** Bulleted list styled to match the prose. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
