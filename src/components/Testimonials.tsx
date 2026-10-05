import { Card } from "@/components/ui";

/**
 * Illustrative user scenarios.
 *
 * These are NOT real customer testimonials — DocuAsk has no published users
 * yet — so every card carries an explicit "Ilustrasi" label and the section
 * says so plainly. We never invent customers, logos, or review ratings as if
 * they were real, and we deliberately emit no Review/AggregateRating
 * structured data, so search engines cannot surface these as genuine reviews.
 */

type Scenario = {
  quote: string;
  name: string;
  role: string;
  rating: number;
};

const SCENARIOS: Scenario[] = [
  {
    quote:
      "Dulu tiap karyawan baru bertanya jatah cuti ke saya satu per satu. Sekarang saya kirim satu jawaban yang menunjuk halaman kebijakannya, dan mereka bisa memeriksa sendiri.",
    name: "Rina",
    role: "Manajer HR",
    rating: 5,
  },
  {
    quote:
      "Menelusuri satu klausul di kontrak puluhan halaman biasanya memakan waktu. Sekarang saya langsung diarahkan ke halaman sumbernya dan menilai sendiri isinya.",
    name: "Bagus",
    role: "Staf Legal",
    rating: 5,
  },
  {
    quote:
      "Saat mencari satu angka di laporan klien, saya tidak perlu membaca ulang semuanya. Jawabannya menunjuk halaman persis tempat angkanya berada.",
    name: "Dewi",
    role: "Konsultan",
    rating: 4,
  },
];

function Stars({ n }: { n: number }) {
  const filled = Math.max(0, Math.min(5, n));
  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden className="text-sm tracking-tight text-accent">
        {"★".repeat(filled)}
        <span className="text-line-strong">{"★".repeat(5 - filled)}</span>
      </span>
      <span className="sr-only">{filled} dari 5</span>
    </span>
  );
}

export function Testimonials() {
  return (
    <section className="border-t border-line py-16">
      <h2
        className="font-heading text-center text-heading-2 font-semibold text-ink"
        data-motion
      >
        Skenario pengguna.
      </h2>
      <p
        className="mx-auto mt-2 max-w-xl text-center text-sm text-muted"
        data-motion
      >
        Ilustrasi cara DocuAsk dipakai sehari-hari — bukan testimoni pengguna
        nyata.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {SCENARIOS.map((s) => (
          <Card key={s.name} className="flex h-full flex-col p-5" data-motion>
            <div className="flex items-center justify-between">
              <Stars n={s.rating} />
              <span className="rounded border border-line px-1.5 py-0.5 text-body-sm text-muted">
                Ilustrasi
              </span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">
              &ldquo;{s.quote}&rdquo;
            </p>
            <div className="mt-4 border-t border-line pt-3">
              <p className="text-sm font-medium text-ink">{s.name}</p>
              <p className="text-xs text-muted">{s.role}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
