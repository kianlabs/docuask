import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, Icon, LinkButton } from "@/components/ui";
import { JsonLdGraph } from "@/components/JsonLd";
import { DemoAsk } from "@/components/DemoAsk";
import { SITE, SITE_URL } from "@/lib/site";

/* Public marketing landing page — no API key, no internal jargon. */

export const metadata: Metadata = {
  // `absolute` bypasses the "%s · DocuAsk" template — SITE.title already
  // contains the brand, so the template would duplicate it.
  title: { absolute: SITE.title },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE.title,
    description: SITE.tagline,
    // Overriding `openGraph` here drops the file-based image from layout.tsx,
    // so point at it explicitly (resolved against metadataBase).
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.title }],
  },
};

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
  q: "Berapa jatah cuti tahunan dan tunjangan kesehatannya?",
  a: "Karyawan tetap mendapat 18 hari cuti tahunan berbayar dan tunjangan kesehatan Rp 750.000 per bulan.",
  cites: [
    { file: "kebijakan-cuti-contoh.pdf", page: 1 },
    { file: "kebijakan-cuti-contoh.pdf", page: 2 },
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

const COMPARE = [
  { label: "Jawaban menunjuk halaman sumber", values: ["ya", "tidak", "tidak"] },
  { label: "Hanya dari dokumenmu", values: ["ya", "ya", "tidak"] },
  { label: "Jujur kalau jawaban tidak ada", values: ["ya", "—", "tidak"] },
  { label: "Bisa tanya dengan bahasa sehari-hari", values: ["ya", "tidak", "ya"] },
];

const USE_CASES = [
  {
    href: "/untuk/hr",
    title: "HR",
    body: "Jawab pertanyaan cuti, onboarding, dan kontrak tanpa membuka ulang PDF.",
  },
  {
    href: "/untuk/legal",
    title: "Legal",
    body: "Telusuri klausul di kontrak panjang, lengkap dengan rujukan halaman.",
  },
  {
    href: "/untuk/konsultan",
    title: "Konsultan",
    body: "Temukan temuan dan angka di laporan klien, cepat dan bersitasi.",
  },
];

const WORKSPACE_DOCS = [
  { file: "kebijakan-cuti-contoh.pdf", meta: "2 hal · 6 bagian" },
  { file: "kontrak-kerja-contoh.pdf", meta: "4 hal · 11 bagian" },
  { file: "sop-onboarding-contoh.pdf", meta: "3 hal · 8 bagian" },
];

const STRUCTURED_DATA = [
  {
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: SITE.description,
    inLanguage: "id",
    offers: [
      { "@type": "Offer", name: "Gratis", price: "0", priceCurrency: "IDR" },
      { "@type": "Offer", name: "Pro", price: "99000", priceCurrency: "IDR" },
      { "@type": "Offer", name: "Bisnis", price: "499000", priceCurrency: "IDR" },
    ],
  },
  {
    "@type": "Organization",
    name: SITE.name,
    url: SITE_URL,
    email: SITE.email,
  },
  {
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4">
      <JsonLdGraph nodes={STRUCTURED_DATA} />

      {/* Hero */}
      <section className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <Badge tone="accent" className="mb-4" data-motion>
            <Icon name="file" className="h-3.5 w-3.5" /> Jawaban bersitasi halaman
          </Badge>
          <h1 className="font-heading text-display font-bold text-ink" data-motion>
            Tanya apa pun ke dokumenmu, dapat jawaban bersitasi.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted" data-motion>
            Unggah PDF — kebijakan, kontrak, SOP — lalu tanya dengan bahasa
            sehari-hari. Setiap jawaban menunjuk halaman sumbernya, jadi bisa
            kamu cek sendiri.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3" data-motion>
            <LinkButton href="/signup" size="lg">
              Coba gratis
            </LinkButton>
            <LinkButton href="/app" variant="secondary" size="lg">
              Lihat aplikasi
            </LinkButton>
          </div>
          <p className="mt-3 text-xs text-muted" data-motion>
            Gratis untuk mulai · tanpa kartu kredit · jawaban hanya dari dokumenmu
          </p>
        </div>

        {/* Sample answer card */}
        <Card className="rounded-2xl p-5" data-motion>
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
              <sup className="text-xs font-semibold text-accent">[1]</sup>
              <sup className="text-xs font-semibold text-accent">[2]</sup>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLE.cites.map((c, i) => (
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
      </section>

      {/* How it works */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-center text-heading-2 font-semibold text-ink" data-motion>
          Tiga langkah, selesai.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} data-motion>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft font-semibold text-accent-hover">
                {s.n}
              </div>
              <h3 className="mt-3 font-heading text-heading-3 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why it is trustworthy */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-center text-heading-2 font-semibold text-ink" data-motion>
          Dibuat untuk jawaban yang bisa kamu cek.
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div data-motion>
            <h3 className="font-heading text-heading-3 font-semibold text-ink">
              Anti-halusinasi
            </h3>
            <p className="mt-1 text-sm text-muted">
              Kalau jawabannya tidak ada di dokumen, DocuAsk bilang tidak ada —
              bukan mengarang. Jawaban hanya diambil dari berkas milikmu.
            </p>
          </div>
          <div data-motion>
            <h3 className="font-heading text-heading-3 font-semibold text-ink">
              Dokumen terpisah per akun
            </h3>
            <p className="mt-1 text-sm text-muted">
              Setiap akun hanya bisa mengakses dokumennya sendiri, dijaga di
              level basis data, bukan sekadar di tampilan.
            </p>
          </div>
          <div data-motion>
            <h3 className="font-heading text-heading-3 font-semibold text-ink">
              Sumber selalu terlihat
            </h3>
            <p className="mt-1 text-sm text-muted">
              Setiap kalimat menunjuk halaman asalnya. Kamu yang memutuskan
              percaya atau tidak, bukan modelnya.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison — honest, factual */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-center text-heading-2 font-semibold text-ink" data-motion>
          Bandingkan dengan cara lain.
        </h2>
        <div className="mt-10">
          <Card className="overflow-x-auto" data-motion>
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-3 text-left">
                    <span className="sr-only">Kemampuan</span>
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-center font-heading text-sm font-semibold text-ink"
                  >
                    DocuAsk
                  </th>
                  <th scope="col" className="px-5 py-3 text-center text-sm font-medium text-muted">
                    Ctrl+F di PDF
                  </th>
                  <th scope="col" className="px-5 py-3 text-center text-sm font-medium text-muted">
                    Chatbot umum
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label} className="border-b border-line last:border-0">
                    <th scope="row" className="px-5 py-3 text-left font-normal text-ink">
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-5 py-3 text-center">
                        {v === "ya" ? (
                          <Icon name="check" className="mx-auto h-4 w-4 text-positive" />
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>

      {/* Product tour — faithful static mock of the /app workspace */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-center text-heading-2 font-semibold text-ink" data-motion>
          Beginilah ruang kerjanya.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted" data-motion>
          Dokumen di kiri, percakapan di kanan. Setiap jawaban menunjuk halaman sumbernya.
        </p>
        <Card className="mt-10 overflow-hidden" data-motion>
          <div className="grid sm:grid-cols-[220px_1fr]">
            {/* Document list */}
            <div className="border-b border-line p-4 sm:border-b-0 sm:border-r">
              <p className="px-1 text-xs font-medium text-muted">Dokumen</p>
              <ul className="mt-2 space-y-1">
                {WORKSPACE_DOCS.map((d, i) => (
                  <li
                    key={d.file}
                    className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                      i === 0 ? "bg-accent-soft font-medium text-accent-hover" : "text-muted"
                    }`}
                  >
                    <Icon name="file" className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{d.file}</span>
                      <span className="block text-body-sm text-muted">{d.meta}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Conversation */}
            <div className="bg-canvas p-4 sm:p-6">
              <div className="mx-auto max-w-[520px] space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-sunken px-4 py-2.5 text-sm text-ink">
                    {SAMPLE.q}
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-accent text-white">
                      <Icon name="file" className="h-3 w-3" />
                    </span>
                    DocuAsk
                  </div>
                  <p className="text-sm leading-relaxed text-ink">
                    {SAMPLE.a}{" "}
                    <sup className="text-xs font-semibold text-accent">[1]</sup>
                    <sup className="text-xs font-semibold text-accent">[2]</sup>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SAMPLE.cites.map((c, i) => (
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
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Public demo — ask the sample documents, no signup */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-center text-heading-2 font-semibold text-ink" data-motion>
          Coba tanpa daftar.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted" data-motion>
          Tanya ke tiga dokumen contoh dan lihat jawaban bersitasinya. Tanpa akun, tanpa kartu.
        </p>
        <DemoAsk />
      </section>

      {/* Use cases — internal links to the /untuk/* pages */}
      <section className="border-t border-line py-16">
        <h2 className="font-heading text-center text-heading-2 font-semibold text-ink" data-motion>
          Untuk tim kamu.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {USE_CASES.map((u) => (
            <Link key={u.href} href={u.href} className="block" data-motion>
              <Card className="h-full transition-colors hover:border-line-strong">
                <div className="p-5">
                  <h3 className="font-heading text-heading-3 font-semibold text-ink">{u.title}</h3>
                  <p className="mt-1 text-sm text-muted">{u.body}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-accent">
                    Lihat selengkapnya →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing — Good / Better / Best */}
      <section id="harga" className="scroll-mt-20 border-t border-line py-16">
        <div className="text-center" data-motion>
          <h2 className="font-heading text-heading-2 font-semibold text-ink">Harga yang sederhana</h2>
          <p className="mt-2 text-sm text-muted">
            Mulai gratis, tingkatkan saat butuh. Batalkan kapan saja.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <Card
              key={p.code}
              data-motion
              className={`relative flex flex-col p-6 ${
                p.featured ? "rounded-2xl border-accent ring-1 ring-accent" : ""
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge tone="accent">Direkomendasikan</Badge>
                </div>
              )}
              <h3 className="font-heading text-heading-2 font-semibold text-ink">{p.name}</h3>
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
        <h2 className="font-heading text-center text-heading-2 font-semibold text-ink" data-motion>
          Pertanyaan umum
        </h2>
        <div className="mx-auto mt-8 max-w-2xl divide-y divide-line rounded-xl border border-line bg-surface" data-motion>
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
        <h2 className="font-heading text-heading-2 font-semibold text-ink" data-motion>
          Siap bertanya ke dokumenmu?
        </h2>
        <div className="mt-6 flex justify-center gap-3" data-motion>
          <LinkButton href="/signup" size="lg">
            Coba gratis
          </LinkButton>
        </div>
        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} DocuAsk ·{" "}
          <Link href="/privacy" className="hover:text-ink">
            Privasi
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-ink">
            Ketentuan
          </Link>{" "}
          ·{" "}
          <Link href="/security" className="hover:text-ink">
            Keamanan
          </Link>{" "}
          ·{" "}
          <Link href="/login" className="hover:text-ink">
            Masuk
          </Link>
        </p>
      </section>
    </div>
  );
}
