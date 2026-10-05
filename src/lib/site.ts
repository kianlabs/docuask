/**
 * Central site config for metadata, canonical URLs, sitemap, and JSON-LD.
 *
 * `SITE_URL` should be the public origin (e.g. https://docuask.id). On Vercel
 * it falls back to the deployment URL; locally to localhost. Keeping one source
 * prevents sitemap/OG/canonical from drifting apart.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3005";
}

export const SITE_URL = resolveSiteUrl();

export const SITE = {
  name: "DocuAsk",
  url: SITE_URL,
  locale: "id_ID",
  title: "DocuAsk — tanya apa pun ke dokumenmu",
  tagline: "Tanya PDF-mu, dapat jawaban bersitasi halaman.",
  description:
    "Unggah PDF — kebijakan, kontrak, SOP — lalu tanya dengan bahasa sehari-hari. Setiap jawaban menunjuk halaman sumbernya, jadi bisa kamu cek sendiri. Anti-halusinasi: kalau jawabannya tidak ada di dokumen, DocuAsk bilang tidak ada.",
  email: "halo@docuask.id",
} as const;

/** Public pages that belong in the sitemap, in priority order. */
export const PUBLIC_ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/signup", priority: 0.8, changeFrequency: "monthly" },
  { path: "/security", priority: 0.5, changeFrequency: "yearly" },
  { path: "/untuk/hr", priority: 0.6, changeFrequency: "monthly" },
  { path: "/untuk/legal", priority: 0.6, changeFrequency: "monthly" },
  { path: "/untuk/konsultan", priority: 0.6, changeFrequency: "monthly" },
  { path: "/login", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];
