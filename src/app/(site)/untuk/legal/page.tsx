import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdGraph } from "@/components/JsonLd";
import { UseCasePage } from "@/components/usecase";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "DocuAsk untuk Legal",
  description:
    "Tim legal menelusuri kontrak, klausul, dan perjanjian dengan cepat — setiap jawaban menunjuk halaman sumbernya, siap kamu verifikasi.",
  alternates: { canonical: "/untuk/legal" },
};

const PAGE_NAME = "DocuAsk untuk Legal";
const PAGE_PATH = "/untuk/legal";

const STRUCTURED_DATA = [
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: PAGE_NAME, item: `${SITE_URL}${PAGE_PATH}` },
    ],
  },
  {
    "@type": "WebPage",
    name: PAGE_NAME,
    description: metadata.description,
    inLanguage: "id",
    isPartOf: { "@type": "Organization", name: SITE.name, url: SITE_URL },
  },
];

export default function LegalPage() {
  return (
    <>
      <JsonLdGraph nodes={STRUCTURED_DATA} />
      <div className="mx-auto max-w-[960px] px-4 pt-6">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-accent">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true" className="text-line-strong">
              ›
            </li>
            <li aria-current="page">{PAGE_NAME}</li>
          </ol>
        </nav>
      </div>
      <UseCasePage
        title="DocuAsk untuk Legal"
        intro="Kontrak dan perjanjian panjang menuntut jawaban yang bisa dipertanggungjawabkan. DocuAsk menelusuri klausul di dokumenmu dan mengembalikan jawaban dengan sitasi halaman, bukan rangkuman tanpa dasar."
        pains={[
          {
            title: "Dokumen tebal dan padat",
            body: "Menemukan satu klausul di kontrak ratusan halaman memakan waktu. Ctrl+F hanya cocok kalau kata kuncinya sudah tepat.",
          },
          {
            title: "Risiko salah tafsir",
            body: "Ringkasan tanpa rujukan pasal membuat tinjauan legal rawan keliru. Tiap klaim harus bisa dicek ke teks aslinya.",
          },
          {
            title: "Banyak versi perjanjian",
            body: "Draf dan lampiran berganti-ganti. Sulit memastikan jawaban merujuk versi yang benar dan masih berlaku.",
          },
        ]}
        questions={[
          "Apa syarat pengakhiran kontrak ini?",
          "Berapa denda keterlambatan pembayaran?",
          "Apakah ada klausul force majeure?",
          "Bagaimana ketentuan kerahasiaan (NDA) di perjanjian ini?",
          "Apa saja kewajiban pihak kedua setelah serah terima?",
        ]}
        answer={{
          q: "Berapa denda keterlambatan pembayaran?",
          a: "Keterlambatan pembayaran dikenakan denda 1% dari nilai tagihan per bulan, dihitung sejak hari ke-14 setelah jatuh tempo.",
          cites: [
            { file: "perjanjian-kerja-sama-contoh.pdf", page: 5 },
            { file: "adendum-pembayaran-contoh.pdf", page: 1 },
          ],
        }}
      />
    </>
  );
}
