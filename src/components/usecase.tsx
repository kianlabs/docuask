import { Card, Icon, LinkButton } from "@/components/ui";

/**
 * Shared shell for the "DocuAsk untuk …" use-case pages (HR, Legal,
 * Konsultan). One source for the hero, the pain points, the sample questions,
 * the cited sample answer, and the closing CTA, so the three pages stay
 * visually identical and easy to keep in sync.
 */

export type UseCasePain = { title: string; body: string };
export type UseCaseCite = { file: string; page: number };
export type UseCaseAnswer = { q: string; a: string; cites: UseCaseCite[] };

export function UseCasePage({
  title,
  intro,
  pains,
  questions,
  answer,
  ctaLabel = "Coba gratis",
}: {
  title: string;
  intro: string;
  pains: UseCasePain[];
  questions: string[];
  answer: UseCaseAnswer;
  ctaLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-[960px] px-4">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <h1 className="font-heading text-heading-1 font-bold text-ink" data-motion>
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted" data-motion>
          {intro}
        </p>
        <div className="mt-7" data-motion>
          <LinkButton href="/signup" size="lg">
            {ctaLabel}
          </LinkButton>
        </div>
      </section>

      {/* Pain points */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-heading-2 font-semibold text-ink" data-motion>
          Masalah yang sering terjadi
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {pains.map((p) => (
            <div key={p.title} data-motion>
              <h3 className="font-heading text-heading-3 font-semibold text-ink">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample questions */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-heading-2 font-semibold text-ink" data-motion>
          Contoh pertanyaan
        </h2>
        <Card className="mt-8" data-motion>
          <ul className="divide-y divide-line">
            {questions.map((q) => (
              <li key={q} className="flex items-start gap-3 px-5 py-3.5 text-sm text-ink">
                <Icon name="search" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {q}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Sample answer */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-heading-2 font-semibold text-ink" data-motion>
          Contoh jawaban
        </h2>
        <Card className="mt-8 max-w-[640px] rounded-2xl p-5" data-motion>
          <div className="rounded-lg bg-sunken px-3 py-2 text-sm text-ink">
            <span className="mr-2 text-muted">Kamu</span>
            {answer.q}
          </div>
          <div className="mt-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-accent text-white">
                <Icon name="file" className="h-3 w-3" />
              </span>
              DocuAsk
            </div>
            <p className="text-sm leading-relaxed text-ink">
              {answer.a}{" "}
              {answer.cites.map((_, i) => (
                <sup key={i} className="text-xs font-semibold text-accent">
                  [{i + 1}]
                </sup>
              ))}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {answer.cites.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-xs text-muted"
                >
                  <span className="font-medium text-accent">[{i + 1}]</span>
                  <Icon name="file" className="h-3.5 w-3.5" />
                  {c.file} · hlm. {c.page}
                </span>
              ))}
            </div>
          </div>
        </Card>
        <p className="mt-3 text-xs text-muted" data-motion>
          Ilustrasi dengan dokumen contoh (fiksi) — bukan dokumen nyata.
        </p>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-line py-16 text-center">
        <h2 className="font-heading text-heading-2 font-semibold text-ink" data-motion>
          Siap bertanya ke dokumenmu?
        </h2>
        <div className="mt-6 flex justify-center" data-motion>
          <LinkButton href="/signup" size="lg">
            {ctaLabel}
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
