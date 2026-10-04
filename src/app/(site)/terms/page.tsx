import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat penggunaan layanan DocuAsk: hak, kewajiban, dan batasan tanggung jawab.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "4 Oktober 2026";

export default function TermsPage() {
  return (
    <LegalPage
      title="Syarat & Ketentuan"
      updated={UPDATED}
      intro={`Dengan membuat akun atau memakai DocuAsk, Anda menyetujui syarat ini. Bacalah sebelum mengunggah dokumen, terutama bila dokumen tersebut berisi data orang lain atau data sensitif.`}
    >
      <LegalSection n={1} title="Layanan">
        <p>
          DocuAsk adalah layanan yang membantu Anda mencari jawaban di dalam
          dokumen PDF yang Anda unggah. Jawaban dihasilkan otomatis dengan
          bantuan model bahasa dan <strong className="text-ink">dapat keliru</strong>.
          Setiap jawaban disertai rujukan halaman; Anda bertanggung jawab
          memeriksa sumbernya sebelum memakainya untuk keputusan penting.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Akun Anda">
        <LegalList
          items={[
            "Anda wajib memberikan email yang valid dan menjaga kerahasiaan kata sandi serta API key Anda.",
            "Anda bertanggung jawab atas seluruh aktivitas yang terjadi melalui akun atau API key Anda.",
            "Satu akun tidak boleh dipakai untuk menyalahgunakan layanan, termasuk upaya menembus batas kuota atau mengakses data akun lain.",
          ]}
        />
      </LegalSection>

      <LegalSection n={3} title="Dokumen dan hak Anda">
        <p>
          Anda tetap memegang hak atas dokumen yang Anda unggah. Dengan
          mengunggah, Anda memberi kami izin terbatas untuk menyimpan dan
          memproses dokumen tersebut semata-mata untuk menjalankan layanan
          (lihat <a href="/privacy" className="text-accent hover:text-accent-hover">Kebijakan Privasi</a>).
        </p>
        <p>
          Anda menjamin bahwa Anda berhak mengunggah dokumen tersebut dan bahwa
          isinya tidak melanggar hukum atau hak pihak lain.{" "}
          <strong className="text-ink">
            Jangan unggah data pribadi atau data sensitif pihak lain tanpa izin
            yang sah.
          </strong>
        </p>
      </LegalSection>

      <LegalSection n={4} title="Pemakaian yang dilarang">
        <LegalList
          items={[
            "Mengunggah materi yang melanggar hukum, menyesatkan, atau melanggar hak kekayaan intelektual.",
            "Mencoba mengakses dokumen atau akun milik pengguna lain.",
            "Mengganggu, membebani berlebihan, atau merekayasa balik layanan.",
            "Memakai layanan untuk menyusun konten yang menyesatkan atau merugikan orang lain.",
          ]}
        />
      </LegalSection>

      <LegalSection n={5} title="Paket, harga, dan pembayaran">
        <LegalList
          items={[
            "Paket Gratis dapat dipakai tanpa kartu kredit dengan batas dokumen dan pertanyaan per bulan.",
            "Paket berbayar (Pro, Bisnis) ditagih per bulan dan mengikuti harga yang tercantum di halaman harga saat pembelian.",
            "Perubahan paket berlaku setelah pembayaran dikonfirmasi. Anda dapat berhenti kapan saja; paket tetap aktif sampai akhir periode yang sudah dibayar.",
          ]}
        />
      </LegalSection>

      <LegalSection n={6} title="Ketersediaan dan batasan tanggung jawab">
        <p>
          Kami berupaya menjaga layanan tetap tersedia, tetapi layanan disediakan
          &ldquo;sebagaimana adanya&rdquo; tanpa jaminan bahwa hasilnya selalu
          akurat atau layanan selalu bebas gangguan. Sejauh diizinkan hukum, kami
          tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari
          pemakaian layanan, termasuk keputusan yang diambil berdasarkan jawaban
          otomatis tanpa memeriksa sumbernya.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Penghentian">
        <p>
          Anda dapat berhenti memakai layanan dan menghapus akun kapan saja. Kami
          dapat menangguhkan atau menghentikan akun yang melanggar syarat ini,
          dengan pemberitahuan bila memungkinkan.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Perubahan syarat">
        <p>
          Kami dapat memperbarui syarat ini. Perubahan penting akan diberitahukan
          melalui email atau aplikasi. Melanjutkan pemakaian setelah perubahan
          berarti Anda menyetujui syarat yang baru. Tanggal pembaruan terakhir
          tercantum di atas.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Hukum yang berlaku">
        <p>
          Syarat ini tunduk pada hukum Republik Indonesia. Hubungi{" "}
          <a href={`mailto:${SITE.email}`} className="text-accent hover:text-accent-hover">
            {SITE.email}
          </a>{" "}
          untuk pertanyaan apa pun mengenai syarat ini.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
