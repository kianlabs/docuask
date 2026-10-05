import type { Metadata } from "next";
import { UseCasePage } from "@/components/usecase";

export const metadata: Metadata = {
  title: "DocuAsk untuk HR",
  description:
    "Tim HR menjawab pertanyaan soal cuti, onboarding, kontrak, dan tunjangan langsung dari dokumen — dengan sitasi halaman, bukan menebak.",
  alternates: { canonical: "/untuk/hr" },
};

export default function HrPage() {
  return (
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
        a: "Karyawan tetap mendapat 12 hari cuti tahunan berbayar, bertambah menjadi 15 hari setelah dua tahun masa kerja.",
        cites: [
          { file: "kebijakan-cuti-contoh.pdf", page: 3 },
          { file: "kontrak-kerja-contoh.pdf", page: 2 },
        ],
      }}
    />
  );
}
