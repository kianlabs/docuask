import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";
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
    <html lang="id">
      <body className="min-h-screen bg-canvas font-sans text-[15px] leading-relaxed text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
