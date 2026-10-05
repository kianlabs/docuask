import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";
import { PageMotion } from "@/components/PageMotion";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  // Resolves relative OG/canonical URLs to absolute ones.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "tanya jawab PDF",
    "RAG dokumen",
    "chat dengan dokumen",
    "asisten dokumen AI",
    "cari jawaban di PDF",
    "knowledge base perusahaan",
  ],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE_URL,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas font-sans text-[15px] leading-relaxed text-ink antialiased">
        {/*
         * Runs before the rest of the body parses: enables the entrance
         * animation, but only when motion is welcome and JS is actually
         * running. If the bundle never loads (or GSAP throws), the class is
         * dropped again after 2.5s so the page can never get stuck invisible.
         * See PageMotion.tsx.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!window.matchMedia||!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("js-motion");setTimeout(function(){if(!document.documentElement.hasAttribute("data-motion-ready")){document.documentElement.classList.remove("js-motion")}},2500)}}catch(e){}})();`,
          }}
        />
        <PageMotion />
        {children}
      </body>
    </html>
  );
}
