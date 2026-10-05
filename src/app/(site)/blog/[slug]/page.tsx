import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkButton } from "@/components/ui";
import { JsonLdGraph } from "@/components/JsonLd";
import { POSTS, formatPostDate, getPost } from "@/lib/blog";
import { SITE, SITE_URL } from "@/lib/site";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const structuredData = [
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      inLanguage: "id",
      author: { "@type": "Organization", name: SITE.name, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE_URL },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/blog/${post.slug}`,
      },
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
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: `${SITE_URL}/blog/${post.slug}`,
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-[720px] px-4 py-16">
      <JsonLdGraph nodes={structuredData} />

      <div data-motion>
        <Link
          href="/blog"
          className="text-sm text-accent hover:text-accent-hover"
        >
          ← Catatan
        </Link>
      </div>

      <article className="mt-6">
        <header data-motion>
          <h1 className="font-heading text-heading-1 font-bold text-ink">
            {post.title}
          </h1>
          <p className="mt-3 text-xs text-muted">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            {" · "}
            {post.readingMinutes} menit baca
            {" · "}
            {SITE.name}
          </p>
        </header>

        <div className="mt-10 space-y-8">
          {post.body.map((section, i) => (
            <section key={i} data-motion>
              {section.heading ? (
                <h2 className="font-heading text-heading-3 font-semibold text-ink">
                  {section.heading}
                </h2>
              ) : null}
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
                {section.paragraphs.map((paragraph, j) => (
                  <p key={j}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc space-y-1.5 pl-5">
                    {section.bullets.map((bullet, k) => (
                      <li key={k}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </article>

      <section className="mt-12 border-t border-line pt-8" data-motion>
        <h2 className="font-heading text-heading-3 font-semibold text-ink">
          Coba sendiri ke dokumenmu
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Unggah PDF — kebijakan, kontrak, atau SOP — lalu tanyakan hal yang
          sama. Setiap jawaban menunjuk halaman sumbernya, jadi bisa kamu
          periksa sendiri.
        </p>
        <div className="mt-5">
          <LinkButton href="/signup">Coba gratis</LinkButton>
        </div>
      </section>
    </div>
  );
}
