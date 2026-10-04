import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const heading = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DocuAsk — tanya apa pun ke dokumenmu",
  description:
    "Upload PDF, tanya apa pun, dapat jawaban dengan sitasi halaman. RAG untuk dokumen kamu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-canvas font-sans text-[15px] leading-relaxed text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
