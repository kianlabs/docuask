import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Bagaimana DocuAsk mengumpulkan, memakai, dan melindungi data dokumen serta akun Anda.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "4 Oktober 2026";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Kebijakan Privasi"
      updated={UPDATED}
      intro={`Kebijakan ini menjelaskan data apa yang DocuAsk kumpulkan, untuk apa dipakai, dan bagaimana dilindungi. Kami berusaha menulisnya dengan bahasa yang bisa dibaca, bukan jebakan hukum. Jika ada yang tidak jelas, hubungi ${SITE.email}.`}
    >
      <LegalSection n={1} title="Data yang kami kumpulkan">
        <p>Kami hanya mengumpulkan data yang diperlukan agar layanan berjalan:</p>
        <LegalList
          items={[
            <><strong className="text-ink">Akun:</strong> alamat email dan kata sandi. Kata sandi disimpan dalam bentuk hash (scrypt), tidak pernah sebagai teks biasa.</>,
            <><strong className="text-ink">Dokumen:</strong> berkas PDF yang Anda unggah, beserta potongan teks dan vektor hasil ekstraksi untuk keperluan pencarian.</>,
            <><strong className="text-ink">Pemakaian:</strong> jumlah dokumen dan pertanyaan per bulan, serta catatan transaksi paket.</>,
            <><strong className="text-ink">Teknis:</strong> data sesi (cookie login) dan catatan kesalahan server yang tidak memuat isi dokumen Anda.</>,
          ]}
        />
      </LegalSection>

      <LegalSection n={2} title="Bagaimana dokumen Anda diproses">
        <p>
          Saat Anda mengunggah PDF, teksnya diekstrak dan diubah menjadi vektor
          (embedding) agar bisa dicari. Saat Anda bertanya, sistem mencari
          potongan teks yang paling relevan lalu mengirimkannya ke penyedia
          model bahasa untuk menyusun jawaban.
        </p>
        <p>
          Artinya, potongan teks dari dokumen Anda dapat dikirim ke penyedia
          layanan pihak ketiga yang kami konfigurasi (penyedia embedding dan
          penyedia model bahasa). Kami tidak menjual dan tidak memakai dokumen
          Anda untuk melatih model.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Isolasi data antar akun">
        <p>
          Setiap akun adalah tenant terpisah. Dokumen dan jawaban hanya dapat
          diakses oleh akun pemiliknya. Pemisahan ini ditegakkan di level basis
          data (Row-Level Security), bukan hanya di tampilan, sehingga akun lain
          tidak dapat membaca dokumen Anda meski ada kekeliruan pada aplikasi.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Dasar dan tujuan pemakaian">
        <LegalList
          items={[
            "Menyediakan layanan: menyimpan dokumen dan menjawab pertanyaan Anda.",
            "Menjaga keamanan: mendeteksi penyalahgunaan dan membatasi laju permintaan.",
            "Menagih pembayaran: mencatat pesanan dan status paket Anda.",
            "Berkomunikasi: memberi tahu perubahan penting pada layanan.",
          ]}
        />
      </LegalSection>

      <LegalSection n={5} title="Penyimpanan dan retensi">
        <p>
          Dokumen disimpan selama akun Anda aktif. Anda dapat menghapus dokumen
          kapan saja melalui ruang kerja; setelah dihapus, data terkait tidak
          lagi dipakai untuk menjawab pertanyaan. Menghapus akun akan menghapus
          dokumen dan data terkait, kecuali catatan yang wajib kami simpan untuk
          keperluan hukum atau pembukuan.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Keamanan">
        <LegalList
          items={[
            "Kata sandi di-hash dengan scrypt; sesi ditandatangani secara kriptografis (HMAC).",
            "Cookie sesi bersifat httpOnly dan secure saat diakses melalui HTTPS.",
            "Akses administratif dilindungi token rahasia dan bersifat gagal-tertutup.",
            "Kami tidak menampilkan detail internal (galat basis data, kredensial) ke pengguna.",
          ]}
        />
      </LegalSection>

      <LegalSection n={7} title="Hak Anda">
        <p>
          Anda berhak mengakses, memperbaiki, mengekspor, dan menghapus data
          Anda. Sebagian besar dapat dilakukan sendiri dari halaman akun dan
          ruang kerja. Untuk permintaan lain, hubungi{" "}
          <a href={`mailto:${SITE.email}`} className="text-accent hover:text-accent-hover">
            {SITE.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n={8} title="Perubahan kebijakan">
        <p>
          Kami dapat memperbarui kebijakan ini seiring perubahan layanan. Jika
          ada perubahan penting, kami akan memberi tahu melalui email atau
          pemberitahuan di aplikasi. Tanggal pembaruan terakhir tercantum di
          atas halaman ini.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
