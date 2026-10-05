import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdGraph } from "@/components/JsonLd";
import { UseCasePage } from "@/components/usecase";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "DocuAsk untuk HR",
  description:
    "Tim HR menjawab pertanyaan soal cuti, onboarding, kontrak, dan tunjangan langsung dari dokumen — dengan sitasi halaman, bukan menebak.",
  alternates: { canonical: "/untuk/hr" },
};

const PAGE_NAME = "DocuAsk untuk HR";
const PAGE_PATH = "/untuk/hr";

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

export default function HrPage() {
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
        title="DocuAsk untuk HR"
        intro="Kebijakan cuti, SOP onboarding, kontrak kerja, dan tunjangan biasanya tersebar di banyak PDF. DocuAsk membuat tim HR menjawab pertanyaan karyawan langsung dari dokumen yang berlaku, lengkap dengan halaman sumbernya."
        pains={[
          {
            title: "Pertanyaan yang berulang",
            body: "Karyawan terus menanyakan hal yang sama soal cuti dan reimbursement. Tim HR mengulang jawaban manual setiap kali.",
          },
          {
            title: "Kebijakan sering berubah",
            body: "Versi kebijakan berganti tiap tahun. Sulit memastikan jawaban memakai dokumen yang masih berlaku, bukan salinan lama.",
          },
          {
            title: "Jawaban tanpa sumber",
            body: "Tanpa rujukan halaman, karyawan ragu dan HR harus membuka ulang PDF untuk membuktikan isinya.",
          },
        ]}
        questions={[
          "Berapa jatah cuti tahunan karyawan tetap?",
          "Apa isi SOP onboarding minggu pertama?",
          "Bagaimana prosedur pengajuan reimbursement?",
          "Apa syarat masa percobaan di kontrak kerja?",
          "Apakah tunjangan kesehatan berlaku untuk keluarga?",
        ]}
        answer={{
          q: "Berapa jatah cuti tahunan karyawan tetap?",
          a: "Setiap karyawan tetap berhak atas 18 hari cuti berbayar per tahun, dapat diambil setelah 3 bulan masa kerja. Sisa cuti maksimal 6 hari dapat dibawa ke tahun berikutnya.",
          cites: [
            { file: "kebijakan-cuti-contoh.pdf", page: 2 },
            { file: "kebijakan-cuti-contoh.pdf", page: 1 },
          ],
        }}
      />
    </>
  );
}
