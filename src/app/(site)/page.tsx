import Link from "next/link";
import { Badge, Card, Icon, LinkButton } from "@/components/ui";

/* Public marketing landing page — no API key, no internal jargon. */

const STEPS = [
  {
    n: "1",
    title: "Unggah PDF",
    body: "Tarik berkas ke ruang kerja. Kebijakan, kontrak, SOP — apa saja.",
  },
  {
    n: "2",
    title: "Ajukan pertanyaan",
    body: "Tanya dengan bahasa sehari-hari, seperti ke rekan kerja.",
  },
  {
    n: "3",
    title: "Dapat jawaban bersitasi",
    body: "Setiap jawaban menunjuk halaman sumbernya, jadi bisa kamu cek.",
  },
];

const SAMPLE = {
  q: "Berapa lama jatah cuti tahunan dan kapan harus diajukan?",
  a: "Karyawan mendapat 12 hari cuti tahunan. Pengajuan dilakukan minimal 7 hari sebelum tanggal cuti melalui atasan langsung.",
  cites: [
    { file: "kebijakan-cuti.pdf", page: 3 },
    { file: "kebijakan-cuti.pdf", page: 5 },
  ],
};

const PLANS = [
  {
    code: "free",
    name: "Gratis",
    price: "Rp 0",
    tagline: "Untuk mencoba.",
    featured: false,
    features: ["3 dokumen", "50 pertanyaan / bulan", "Sitasi halaman", "1 pengguna"],
  },
  {
    code: "pro",
    name: "Pro",
    price: "Rp 99.000",
    tagline: "Untuk tim kecil & profesional.",
    featured: true,
    features: [
      "50 dokumen",
      "2.000 pertanyaan / bulan",
      "Sitasi halaman",
      "Riwayat & ekspor",
      "Dukungan email",
    ],
  },
  {
    code: "bisnis",
    name: "Bisnis",
    price: "Rp 499.000",
    tagline: "Untuk organisasi.",
    featured: false,
    features: ["Dokumen tak terbatas", "Pertanyaan tak terbatas", "Sitasi halaman", "Dukungan prioritas"],
  },
];

const FAQ = [
  {
    q: "Apakah jawabannya bisa dipercaya?",
    a: "Setiap jawaban disertai nomor sitasi yang menunjuk halaman persis di dokumenmu. Kamu selalu bisa membuka sumbernya dan menilai sendiri.",
  },
  {
    q: "Dokumen saya aman?",
    a: "Dokumen dipisah per akun, dan jawaban hanya diambil dari berkas milikmu — bukan dari internet.",
  },
  {
    q: "Perlu paham teknis?",
    a: "Tidak. Cukup unggah PDF dan bertanya. Tidak ada API key yang perlu ditempel.",
  },
  {
    q: "Bisa berhenti kapan saja?",
    a: "Bisa. Paket Gratis tidak butuh kartu kredit, dan kamu dapat meningkatkan paket kapan pun.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <Badge tone="accent" className="mb-4">
            <Icon name="search" className="h-3.5 w-3.5" /> Didukung AI
          </Badge>
          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Tanya apa pun ke dokumenmu, dapat jawaban bersitasi.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted">
            Unggah PDF, ajukan pertanyaan, dan terima jawaban yang menunjuk
            halaman sumbernya. Tanpa jargon, tanpa API key.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <LinkButton href="/signup" size="lg">
              Coba gratis
            </LinkButton>
            <LinkButton href="/app" variant="secondary" size="lg">
              Buka aplikasi
            </LinkButton>
          </div>
          <p className="mt-3 text-xs text-muted">
            Gratis selamanya untuk mulai · tanpa kartu kredit
          </p>
        </div>

        {/* Sample answer card */}
        <Card className="p-5">
          <div className="rounded-lg bg-sunken px-3 py-2 text-sm text-ink">
            <span className="mr-2 text-muted">Kamu</span>
            {SAMPLE.q}
          </div>
          <div className="mt-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-accent text-white">
                <Icon name="file" className="h-3 w-3" />
              </span>
              DocuAsk
            </div>
            <p className="text-sm leading-relaxed text-ink">
              {SAMPLE.a}{" "}
              <sup className="font-medium text-accent">[1]</sup>
              <sup className="font-medium text-accent">[2]</sup>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLE.cites.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-muted"
                >
                  <span className="font-medium text-accent">[{i + 1}]</span>
                  <Icon name="file" className="h-3.5 w-3.5" />
                  {c.file} · hlm. {c.page}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* How it works */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-center text-2xl font-semibold text-ink">
          Tiga langkah, selesai.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft font-semibold text-accent-hover">
                {s.n}
              </div>
              <h3 className="mt-3 font-medium text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing — Good / Better / Best */}
      <section id="harga" className="scroll-mt-20 border-t border-line py-16">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold text-ink">Harga yang sederhana</h2>
          <p className="mt-2 text-sm text-muted">
            Mulai gratis, tingkatkan saat butuh. Batalkan kapan saja.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <Card
              key={p.code}
              className={`relative flex flex-col p-6 ${
                p.featured ? "border-accent ring-1 ring-accent" : ""
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge tone="accent">Direkomendasikan</Badge>
                </div>
              )}
              <h3 className="font-medium text-ink">{p.name}</h3>
              <p className="mt-0.5 text-xs text-muted">{p.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-ink">{p.price}</span>
                <span className="text-sm text-muted">/bulan</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
                    {f}
                  </li>
                ))}
              </ul>
              <LinkButton
                href="/signup"
                variant={p.featured ? "primary" : "secondary"}
                className="mt-6 w-full"
              >
                {p.featured ? "Mulai Pro" : `Pilih ${p.name}`}
              </LinkButton>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-center text-2xl font-semibold text-ink">
          Pertanyaan umum
        </h2>
        <div className="mx-auto mt-8 max-w-2xl divide-y divide-line rounded-xl border border-line bg-surface">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink">
                {f.q}
                <span className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-line py-16 text-center">
        <h2 className="font-heading text-2xl font-semibold text-ink">
          Siap bertanya ke dokumenmu?
        </h2>
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton href="/signup" size="lg">
            Coba gratis
          </LinkButton>
        </div>
        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} DocuAsk ·{" "}
          <Link href="/login" className="hover:text-ink">
            Masuk
          </Link>
        </p>
      </section>
    </div>
  );
}
