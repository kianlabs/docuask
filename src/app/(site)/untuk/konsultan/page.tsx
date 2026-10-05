import type { Metadata } from "next";
import { UseCasePage } from "@/components/usecase";

export const metadata: Metadata = {
  title: "DocuAsk untuk Konsultan",
  description:
    "Konsultan menemukan temuan, rekomendasi, dan angka di laporan klien dan dokumen proyek dengan cepat — setiap jawaban bersitasi halaman.",
  alternates: { canonical: "/untuk/konsultan" },
};

export default function KonsultanPage() {
  return (
    <UseCasePage
      title="DocuAsk untuk Konsultan"
      intro="Laporan klien, dokumen proyek, dan hasil riset menumpuk di setiap engagement. DocuAsk membantu tim konsultan menarik temuan dan angka yang tepat dari dokumen, dengan sitasi halaman agar mudah dirujuk saat presentasi."
      pains={[
        {
          title: "Laporan menumpuk per proyek",
          body: "Setiap klien punya puluhan dokumen. Mencari satu temuan atau angka di antaranya menghabiskan waktu yang seharusnya untuk analisis.",
        },
        {
          title: "Angka harus akurat",
          body: "Salah mengutip anggaran atau temuan survei bisa merusak kredibilitas. Tiap angka perlu jejak ke halaman asalnya.",
        },
        {
          title: "Serah terima ke tim",
          body: "Saat proyek berpindah tangan, tim baru harus menelusuri ulang dokumen lama untuk memahami konteks dan rekomendasi.",
        },
      ]}
      questions={[
        "Apa rekomendasi utama di laporan ini?",
        "Berapa anggaran yang dialokasikan untuk fase 2?",
        "Apa temuan survei pada bagian metode?",
        "Apa risiko yang disebut di ringkasan eksekutif?",
        "Apa metrik keberhasilan yang disepakati di dokumen proyek?",
      ]}
      answer={{
        q: "Berapa anggaran yang dialokasikan untuk fase 2?",
        a: "Fase 2 dialokasikan sebesar Rp 1,2 miliar, terbagi untuk pengembangan produk dan riset pasar.",
        cites: [
          { file: "laporan-proyek-contoh.pdf", page: 12 },
          { file: "rencana-anggaran-contoh.pdf", page: 4 },
        ],
      }}
    />
  );
}
