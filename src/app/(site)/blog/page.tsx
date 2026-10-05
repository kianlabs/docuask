import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { JsonLdGraph } from "@/components/JsonLd";
import { POSTS, formatPostDate } from "@/lib/blog";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Catatan",
  description:
    "Catatan DocuAsk soal bertanya ke dokumen: memeriksa sitasi, menyusun pertanyaan yang baik, dan memakai rujukan halaman di tim HR.",
  alternates: { canonical: "/blog" },
};

const STRUCTURED_DATA = [
  {
    "@type": "Blog",
    name: `Catatan ${SITE.name}`,
    description:
      "Catatan soal bertanya ke dokumen: verifikasi sitasi, pola pertanyaan, dan penggunaan rujukan halaman.",
    url: `${SITE_URL}/blog`,
    inLanguage: "id",
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE_URL,
    },
    blogPost: POSTS.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
    })),
  },
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catatan",
        item: `${SITE_URL}/blog`,
      },
    ],
  },
];

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16">
      <JsonLdGraph nodes={STRUCTURED_DATA} />

      <header data-motion>
        <h1 className="font-heading text-heading-1 font-bold text-ink">Catatan</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Tulisan singkat soal bertanya ke dokumen: cara memeriksa jawaban,
          menyusun pertanyaan, dan memakai rujukan halaman di pekerjaan
          sehari-hari.
        </p>
      </header>

      <div className="mt-10 space-y-4">
        {POSTS.map((post) => (
          <Card key={post.slug} data-motion>
            <Link
              href={`/blog/${post.slug}`}
              className="block rounded-xl p-5 transition-colors hover:bg-sunken"
            >
              <h2 className="font-heading text-heading-3 font-semibold text-ink">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {post.description}
              </p>
              <p className="mt-3 text-xs text-muted">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                {" · "}
                {post.readingMinutes} menit baca
              </p>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
