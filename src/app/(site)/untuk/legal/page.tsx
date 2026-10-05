import type { Metadata } from "next";
import { UseCasePage } from "@/components/usecase";

export const metadata: Metadata = {
  title: "DocuAsk untuk Legal",
  description:
    "Tim legal menelusuri kontrak, klausul, dan perjanjian dengan cepat — setiap jawaban menunjuk halaman sumbernya, siap kamu verifikasi.",
  alternates: { canonical: "/untuk/legal" },
};

export default function LegalPage() {
  return (
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
  );
}
