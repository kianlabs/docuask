import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Keamanan",
  description:
    "Bagaimana DocuAsk mengisolasi data antar akun, melindungi kata sandi dan sesi, serta menegakkan kuota pemakaian.",
  alternates: { canonical: "/security" },
};

const UPDATED = "5 Oktober 2026";

export default function SecurityPage() {
  return (
    <LegalPage
      title="Keamanan"
      updated={UPDATED}
      intro={`Halaman ini merangkum cara DocuAsk melindungi dokumen dan akun Anda, ditulis apa adanya agar tim HR dan legal bisa menilai sendiri. Kami menyebutkan batasannya juga — bukan hanya kelebihannya. Jika ada yang ingin Anda tanyakan atau uji, hubungi ${SITE.email}.`}
    >
      <LegalSection n={1} title="Isolasi data antar akun">
        <p>
          Setiap akun adalah tenant terpisah. Dokumen, potongan teks, dan
          jawaban hanya dapat diakses oleh akun pemiliknya.
        </p>
        <p>
          Pemisahan ini ditegakkan di level basis data, bukan hanya di tampilan.
          Tabel dokumen memakai Row-Level Security (RLS) dengan{" "}
          <strong className="text-ink">FORCE ROW LEVEL SECURITY</strong>, dan
          aplikasi terhubung sebagai role non-superuser. Superuser atau role
          dengan BYPASSRLS dapat menembus RLS, jadi keduanya sengaja tidak
          dipakai. Dengan begitu, akun lain tetap tidak dapat membaca dokumen
          Anda meski ada kekeliruan pada lapisan aplikasi.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Kata sandi dan sesi">
        <LegalList
          items={[
            <>
              <strong className="text-ink">Kata sandi</strong> di-hash dengan
              scrypt (memory-hard), tidak pernah disimpan sebagai teks biasa,
              dan tidak pernah ditampilkan kembali.
            </>,
            <>
              <strong className="text-ink">Sesi</strong> berupa cookie bertanda
              tangan HMAC-SHA256; cookie bersifat httpOnly, SameSite=Lax, dan
              secure saat diakses melalui HTTPS. Cookie yang dimanipulasi
              ditolak.
            </>,
            <>
              <strong className="text-ink">Token admin</strong> dibandingkan
              dengan perbandingan waktu-konstan (timing-safe) dan bersifat
              gagal-tertutup: jika tidak dikonfigurasi, akses admin ditutup.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection n={3} title="Dokumen Anda tidak dipakai untuk melatih model">
        <p>
          Dokumen Anda tidak dijual dan tidak dipakai untuk melatih model.
        </p>
        <p>
          Saat Anda bertanya, hanya potongan teks relevan yang diambil dari
          dokumen Anda yang dikirim ke penyedia embedding dan penyedia model
          bahasa yang kami konfigurasi, semata-mata untuk menyusun jawaban.
          Pengiriman ini adalah bagian yang tak terhindarkan dari cara layanan
          bekerja; di luar itu, isi dokumen Anda tidak kami sebarkan.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Jawaban hanya dari dokumenmu">
        <p>
          Pencarian jawaban dibatasi pada berkas milik akun yang sedang
          bertanya. Sistem tidak menarik dokumen dari akun lain.
        </p>
        <p>
          Jika jawabannya tidak ada di dalam dokumen Anda, sistem akan
          mengatakan bahwa jawabannya tidak ditemukan, bukan mengarang.
          Pertanyaan yang tidak menemukan dasar pada dokumen tidak dihitung
          sebagai pemakaian.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Transport dan header keamanan">
        <p>
          Kami menyarankan dan mengandalkan HTTPS. Pada setiap respons, aplikasi
          mengirim header keamanan berikut:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-ink">HSTS</strong>{" "}
              (Strict-Transport-Security) — memaksa koneksi HTTPS.
            </>,
            <>
              <strong className="text-ink">X-Content-Type-Options: nosniff</strong>{" "}
              — mencegah browser menebak tipe konten.
            </>,
            <>
              <strong className="text-ink">X-Frame-Options: DENY</strong> —
              mencegah halaman dibingkai (clickjacking).
            </>,
            <>
              <strong className="text-ink">Referrer-Policy</strong> —
              strict-origin-when-cross-origin, agar URL lengkap tidak bocor.
            </>,
            <>
              <strong className="text-ink">Permissions-Policy</strong> —
              menonaktifkan kamera, mikrofon, geolokasi, dan pembayaran.
            </>,
            <>
              <strong className="text-ink">Cross-Origin-Opener-Policy</strong>{" "}
              — same-origin, mengisolasi origin dari referensi lintas situs.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection n={6} title="Pembatasan pemakaian">
        <p>
          Kuota dokumen dan pertanyaan ditegakkan per paket, dan diperiksa
          sebelum pekerjaan dijalankan. Tujuannya mencegah penyalahgunaan dan
          menjaga layanan tetap adil bagi semua pelanggan. Jika kuota habis,
          permintaan ditolak dan Anda dapat menaikkan paket untuk melanjutkan.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Batasan yang jujur">
        <p>
          Kami menyebutkan ini agar ekspektasi Anda benar sejak awal:
        </p>
        <LegalList
          items={[
            "PDF hasil scan tanpa lapisan teks (image-only) belum didukung. Unggahan seperti ini ditolak dengan kode 422 karena tidak ada teks yang bisa diekstrak. OCR sedang direncanakan.",
            "Jawaban dihasilkan otomatis dengan bantuan model bahasa dan dapat keliru. Setiap jawaban disertai rujukan halaman; Anda bertanggung jawab memeriksa sumbernya sebelum dipakai untuk keputusan penting.",
            "Login admin saat ini masih memakai token rahasia, bukan akun admin tersendiri.",
          ]}
        />
      </LegalSection>

      <LegalSection n={8} title="Melaporkan masalah keamanan">
        <p>
          Jika Anda menemukan celah atau perilaku mencurigakan, beri tahu kami
          di{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="text-accent hover:text-accent-hover"
          >
            {SITE.email}
          </a>
          . Sertakan langkah-langkah untuk mereproduksi masalah bila
          memungkinkan. Kami akan menindaklanjuti laporan dengan serius dan
          secepat yang kami bisa.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
