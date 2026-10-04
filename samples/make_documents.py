#!/usr/bin/env python3
"""Generate a library of sample PDFs for testing DocuAsk RAG.

Reuses the dependency-free PDF writer in `make_sample_pdf.py` (real text layer,
base-14 Helvetica, WinAnsi). Every document uses a distinct set of facts and
numbers so cross-document questions ("cuti vs. perjalanan dinas") can be tested
and verified against the source.

Usage:
    python3 samples/make_documents.py [out_dir]

Default output: samples/library/
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_sample_pdf import build_pdf  # noqa: E402  (path insert above)

DOCS = {
    # ------------------------------------------------------------------ HR
    "01-kebijakan-cuti-benefit.pdf": [
        {
            "title": "Kebijakan Cuti dan Benefit Karyawan",
            "subtitle": "PT Nusantara Data - Dokumen Internal - Versi 3.1",
            "body": [
                ("h", "1. Tujuan"),
                ("p", "Dokumen ini menjelaskan hak cuti, tunjangan, dan cara pengajuan"),
                ("p", "bagi seluruh karyawan tetap PT Nusantara Data."),
                ("gap", ""),
                ("h", "2. Ruang Lingkup"),
                ("p", "Berlaku untuk semua karyawan tetap dan kontrak yang telah"),
                ("p", "menyelesaikan masa percobaan."),
                ("gap", ""),
                ("h", "3. Ringkasan Cepat"),
                ("b", "Cuti tahunan: 18 hari berbayar per tahun."),
                ("b", "Tunjangan kesehatan: Rp 750.000 per bulan."),
                ("b", "Tunjangan internet: Rp 250.000 per bulan."),
                ("b", "Bonus tahunan: maksimal 2 kali gaji pokok."),
            ],
        },
        {
            "title": "Bagian A - Ketentuan Cuti",
            "subtitle": "Lanjutan Kebijakan Cuti dan Benefit Karyawan",
            "body": [
                ("h", "4. Cuti Tahunan"),
                ("b", "Setiap karyawan tetap berhak atas 18 hari cuti berbayar per tahun."),
                ("b", "Cuti dapat diambil setelah 3 bulan masa kerja."),
                ("b", "Sisa cuti maksimal 6 hari dapat dibawa ke tahun berikutnya."),
                ("b", "Sisa cuti yang dibawa hangus pada tanggal 31 Maret."),
                ("b", "Pengajuan cuti minimal 7 hari kerja sebelum tanggal mulai."),
                ("gap", ""),
                ("h", "5. Cuti Sakit"),
                ("b", "Cuti sakit sampai 2 hari tidak memerlukan surat dokter."),
                ("b", "Cuti sakit lebih dari 2 hari berturut-turut wajib surat dokter."),
                ("gap", ""),
                ("h", "6. Cuti Melahirkan"),
                ("b", "Cuti melahirkan diberikan selama 90 hari kalender."),
            ],
        },
        {
            "title": "Bagian B - Tunjangan dan Pengajuan",
            "subtitle": "Lanjutan Kebijakan Cuti dan Benefit Karyawan",
            "body": [
                ("h", "7. Tunjangan"),
                ("b", "Tunjangan kesehatan sebesar Rp 750.000 per bulan."),
                ("b", "Tunjangan internet sebesar Rp 250.000 per bulan untuk kerja hybrid."),
                ("b", "Bonus tahunan maksimal 2 kali gaji pokok."),
                ("gap", ""),
                ("h", "8. Cara Mengajukan"),
                ("b", "Ajukan melalui portal HR perusahaan."),
                ("b", "Persetujuan atasan langsung paling lambat 2 hari kerja."),
                ("b", "Pengajuan yang disetujui tercatat otomatis di slip gaji."),
                ("gap", ""),
                ("h", "9. Kontak"),
                ("b", "Email HR: hr@nusantaradata.example"),
                ("b", "Jam layanan: Senin sampai Jumat, 09.00 sampai 17.00."),
            ],
        },
    ],
    "02-panduan-onboarding.pdf": [
        {
            "title": "Panduan Onboarding Karyawan Baru",
            "subtitle": "PT Nusantara Data - People Operations - Versi 2.4",
            "body": [
                ("h", "1. Hari Pertama"),
                ("b", "Lapor ke resepsionis lantai 8 pada pukul 09.00 WIB."),
                ("b", "Bawa KTP, NPWP, dan rekening bank untuk penggajian."),
                ("b", "Ambil laptop kerja dan kartu akses di meja IT."),
                ("gap", ""),
                ("h", "2. Akun dan Akses"),
                ("b", "Email korporat aktif dalam 1 hari kerja."),
                ("b", "Akses repositori kode dan VPN diberikan oleh tim IT."),
                ("b", "Aktifkan autentikasi dua faktor wajib pada hari pertama."),
                ("gap", ""),
                ("h", "3. Masa Percobaan"),
                ("p", "Masa percobaan berlangsung 3 bulan dengan evaluasi di bulan ke-1,"),
                ("p", "ke-2, dan ke-3 bersama atasan langsung."),
            ],
        },
        {
            "title": "Onboarding - Bagian Lanjutan",
            "subtitle": "Lanjutan Panduan Onboarding Karyawan Baru",
            "body": [
                ("h", "4. Pelatihan Wajib"),
                ("b", "Induksi perusahaan: 4 jam pada minggu pertama."),
                ("b", "Pelatihan keamanan informasi: 2 jam, wajib sebelum minggu ke-2."),
                ("b", "Pelatihan kode etik: 1 jam, wajib dalam 30 hari."),
                ("gap", ""),
                ("h", "5. Buddy dan Mentor"),
                ("b", "Setiap karyawan baru mendapat satu buddy selama 30 hari."),
                ("b", "Sesi dengan mentor dijadwalkan tiap 2 minggu."),
                ("gap", ""),
                ("h", "6. Benefit Mulai Berlaku"),
                ("b", "Asuransi kesehatan aktif sejak hari pertama kerja."),
                ("b", "Cuti tahunan mulai terakru setelah 3 bulan masa kerja."),
            ],
        },
    ],
    "03-kebijakan-kerja-remote.pdf": [
        {
            "title": "Kebijakan Kerja Remote dan Hybrid",
            "subtitle": "PT Nusantara Data - People Operations - Versi 1.7",
            "body": [
                ("h", "1. Ketentuan Umum"),
                ("b", "Karyawan dapat bekerja remote maksimal 3 hari per minggu."),
                ("b", "Minimal 2 hari per minggu bekerja dari kantor."),
                ("b", "Jadwal remote disepakati bersama atasan langsung."),
                ("gap", ""),
                ("h", "2. Jam Kerja"),
                ("b", "Jam inti (core hours): 10.00 sampai 15.00 WIB."),
                ("b", "Total jam kerja: 8 jam per hari, 40 jam per minggu."),
                ("b", "Log masuk dan log keluar melalui sistem absensi daring."),
                ("gap", ""),
                ("h", "3. Tunjangan Remote"),
                ("b", "Tunjangan internet Rp 250.000 per bulan."),
                ("b", "Tunjangan listrik Rp 150.000 per bulan."),
            ],
        },
        {
            "title": "Remote - Peralatan dan Keamanan",
            "subtitle": "Lanjutan Kebijakan Kerja Remote dan Hybrid",
            "body": [
                ("h", "4. Peralatan Kerja"),
                ("b", "Perusahaan menyediakan laptop dan headset."),
                ("b", "Penggantian perangkat setiap 3 tahun atau saat rusak."),
                ("gap", ""),
                ("h", "5. Keamanan Saat Remote"),
                ("b", "Wajib terhubung VPN perusahaan untuk akses sistem internal."),
                ("b", "Dilarang menyimpan dokumen internal di penyimpanan pribadi."),
                ("b", "Layar wajib terkunci otomatis setelah 5 menit tidak aktif."),
                ("gap", ""),
                ("h", "6. Dukungan"),
                ("b", "Bantuan IT tersedia pukul 08.00 sampai 20.00 WIB."),
                ("b", "Hubungi helpdesk untuk kendala perangkat atau akses."),
            ],
        },
    ],
    # --------------------------------------------------------------- LEGAL
    "04-kontrak-kerja-karyawan-tetap.pdf": [
        {
            "title": "Perjanjian Kerja Karyawan Tetap",
            "subtitle": "PT Nusantara Data - Divisi Legal - No. PKK/2024/0871",
            "body": [
                ("h", "1. Pihak"),
                ("p", "Perjanjian ini dibuat antara PT Nusantara Data (Perusahaan) dan"),
                ("p", "karyawan tetap yang namanya tercantum pada lampiran."),
                ("gap", ""),
                ("h", "2. Masa Kerja"),
                ("b", "Perjanjian berlaku untuk waktu tidak tertentu (PKWTT)."),
                ("b", "Masa percobaan 3 bulan dengan upah penuh."),
                ("gap", ""),
                ("h", "3. Upah"),
                ("b", "Upah dibayarkan setiap tanggal 25 setiap bulan."),
                ("b", "Komponen upah: gaji pokok, tunjangan jabatan, tunjangan transport."),
                ("gap", ""),
                ("h", "4. Waktu Kerja"),
                ("b", "40 jam kerja per minggu, 5 hari kerja."),
            ],
        },
        {
            "title": "Kontrak Kerja - Kewajiban dan Sanksi",
            "subtitle": "Lanjutan Perjanjian Kerja Karyawan Tetap",
            "body": [
                ("h", "5. Kerahasiaan"),
                ("b", "Karyawan wajib menjaga kerahasiaan data perusahaan."),
                ("b", "Kewajiban kerahasiaan berlaku 2 tahun setelah hubungan kerja berakhir."),
                ("gap", ""),
                ("h", "6. Pengakhiran Hubungan Kerja"),
                ("b", "Resign wajib diajukan minimal 30 hari sebelum tanggal berhenti."),
                ("b", "Perusahaan dapat memutuskan hubungan kerja sesuai peraturan."),
                ("gap", ""),
                ("h", "7. Sanksi"),
                ("b", "Teguran lisan untuk pelanggaran ringan pertama."),
                ("b", "Surat peringatan tertulis untuk pelanggaran berulang."),
                ("gap", ""),
                ("h", "8. Penyelesaian Sengketa"),
                ("b", "Diselesaikan secara musyawarah terlebih dahulu."),
                ("b", "Jika gagal, melalui Pengadilan Hubungan Industrial."),
            ],
        },
    ],
    "05-kode-etik-perusahaan.pdf": [
        {
            "title": "Kode Etik dan Perilaku Perusahaan",
            "subtitle": "PT Nusantara Data - Compliance - Versi 4.0",
            "body": [
                ("h", "1. Prinsip Dasar"),
                ("b", "Integritas dalam setiap keputusan bisnis."),
                ("b", "Kepatuhan terhadap hukum yang berlaku."),
                ("b", "Menghormati rekan kerja tanpa diskriminasi."),
                ("gap", ""),
                ("h", "2. Benturan Kepentingan"),
                ("b", "Wajib melaporkan benturan kepentingan ke atasan dan Compliance."),
                ("b", "Dilarang menerima hadiah bernilai lebih dari Rp 500.000."),
                ("gap", ""),
                ("h", "3. Gratifikasi"),
                ("b", "Segala bentuk suap dan gratifikasi dilarang."),
                ("b", "Pelanggaran dilaporkan ke kanal Whistleblowing."),
            ],
        },
        {
            "title": "Kode Etik - Pelaporan dan Sanksi",
            "subtitle": "Lanjutan Kode Etik dan Perilaku Perusahaan",
            "body": [
                ("h", "4. Kanal Pelaporan"),
                ("b", "Email: whistleblowing@nusantaradata.example"),
                ("b", "Laporan dapat disampaikan secara anonim."),
                ("b", "Identitas pelapor dilindungi kerahasiaannya."),
                ("gap", ""),
                ("h", "5. Sanksi"),
                ("b", "Pelanggaran ringan: teguran tertulis."),
                ("b", "Pelanggaran berat: pemutusan hubungan kerja."),
                ("gap", ""),
                ("h", "6. Tanggung Jawab Sosial"),
                ("b", "Program CSR tahunan minimal 2 persen dari laba bersih."),
            ],
        },
    ],
    # ------------------------------------------------------------ OPERASI
    "06-sop-pengadaan-barang-jasa.pdf": [
        {
            "title": "SOP Pengadaan Barang dan Jasa",
            "subtitle": "PT Nusantara Data - Operasi - Versi 2.2",
            "body": [
                ("h", "1. Tujuan"),
                ("p", "Mengatur alur pengadaan agar efisien, transparan, dan terkendali."),
                ("gap", ""),
                ("h", "2. Ambang Batas Persetujuan"),
                ("b", "Sampai Rp 10.000.000: cukup persetujuan manajer."),
                ("b", "Rp 10.000.001 sampai Rp 100.000.000: persetujuan direktur."),
                ("b", "Di atas Rp 100.000.000: persetujuan dewan direksi."),
                ("gap", ""),
                ("h", "3. Metode Pengadaan"),
                ("b", "Pembelian langsung untuk nilai di bawah Rp 10.000.000."),
                ("b", "Minimal 3 penawaran untuk nilai di atas Rp 50.000.000."),
                ("b", "Tender terbuka untuk nilai di atas Rp 500.000.000."),
            ],
        },
        {
            "title": "SOP Pengadaan - Alur Proses",
            "subtitle": "Lanjutan SOP Pengadaan Barang dan Jasa",
            "body": [
                ("h", "4. Alur Proses"),
                ("b", "Langkah 1: permintaan pengadaan (PR) dari unit peminta."),
                ("b", "Langkah 2: verifikasi anggaran oleh Finance."),
                ("b", "Langkah 3: proses pengadaan sesuai metode."),
                ("b", "Langkah 4: penerimaan barang dan berita acara."),
                ("b", "Langkah 5: pembayaran ke vendor."),
                ("gap", ""),
                ("h", "5. Waktu Proses"),
                ("b", "Target penyelesaian: 14 hari kerja sejak PR disetujui."),
                ("b", "Pembayaran vendor maksimal 30 hari setelah berita acara."),
            ],
        },
        {
            "title": "SOP Pengadaan - Vendor",
            "subtitle": "Lanjutan SOP Pengadaan Barang dan Jasa",
            "body": [
                ("h", "6. Kualifikasi Vendor"),
                ("b", "Vendor wajib memiliki NPWP dan akta perusahaan."),
                ("b", "Vendor dievaluasi setiap 6 bulan."),
                ("b", "Vendor dengan skor di bawah 70 dikeluarkan dari daftar."),
                ("gap", ""),
                ("h", "7. Larangan"),
                ("b", "Dilarang memecah pengadaan untuk menghindari ambang batas."),
                ("b", "Dilarang pengadaan ke vendor milik keluarga karyawan."),
            ],
        },
    ],
    "07-kebijakan-perjalanan-dinas.pdf": [
        {
            "title": "Kebijakan Perjalanan Dinas",
            "subtitle": "PT Nusantara Data - Finance - Versi 3.3",
            "body": [
                ("h", "1. Ketentuan Umum"),
                ("b", "Perjalanan dinas harus mendapat persetujuan sebelum keberangkatan."),
                ("b", "Pengajuan minimal 5 hari kerja sebelum tanggal berangkat."),
                ("gap", ""),
                ("h", "2. Standar Biaya Hotel"),
                ("b", "Kota besar: maksimal Rp 900.000 per malam."),
                ("b", "Kota sedang: maksimal Rp 650.000 per malam."),
                ("b", "Kota kecil: maksimal Rp 450.000 per malam."),
                ("gap", ""),
                ("h", "3. Transportasi"),
                ("b", "Penerbangan ekonomi untuk perjalanan domestik."),
                ("b", "Penerbangan bisnis hanya untuk perjalanan di atas 6 jam."),
            ],
        },
        {
            "title": "Perjalanan Dinas - Uang Harian",
            "subtitle": "Lanjutan Kebijakan Perjalanan Dinas",
            "body": [
                ("h", "4. Uang Harian (Per Diem)"),
                ("b", "Dalam negeri: Rp 400.000 per hari."),
                ("b", "Luar negeri: 60 dolar AS per hari."),
                ("b", "Uang harian mencakup makan, transport lokal, dan pengeluaran kecil."),
                ("gap", ""),
                ("h", "5. Penggantian Biaya"),
                ("b", "Klaim disertai bukti pengeluaran asli."),
                ("b", "Klaim diajukan maksimal 7 hari kerja setelah kembali."),
                ("b", "Penggantian dibayarkan bersama gaji berikutnya."),
            ],
        },
        {
            "title": "Perjalanan Dinas - Khusus",
            "subtitle": "Lanjutan Kebijakan Perjalanan Dinas",
            "body": [
                ("h", "6. Perjalanan Luar Negeri"),
                ("b", "Wajib persetujuan direktur utama."),
                ("b", "Asuransi perjalanan disediakan perusahaan."),
                ("gap", ""),
                ("h", "7. Pembatalan"),
                ("b", "Pembatalan harus dilaporkan dalam 1 hari kerja."),
                ("b", "Biaya pembatalan akibat kelalaian ditanggung pelaku perjalanan."),
            ],
        },
    ],
    # ---------------------------------------------------------------- IT
    "08-kebijakan-keamanan-informasi.pdf": [
        {
            "title": "Kebijakan Keamanan Informasi",
            "subtitle": "PT Nusantara Data - Divisi TI - Versi 2.8",
            "body": [
                ("h", "1. Ruang Lingkup"),
                ("p", "Berlaku untuk seluruh karyawan, kontraktor, dan mitra yang"),
                ("p", "mengakses sistem informasi perusahaan."),
                ("gap", ""),
                ("h", "2. Kata Sandi"),
                ("b", "Panjang minimal 12 karakter."),
                ("b", "Wajib kombinasi huruf besar, huruf kecil, angka, dan simbol."),
                ("b", "Ganti kata sandi setiap 90 hari."),
                ("b", "Dilarang menggunakan kata sandi yang sama antar sistem."),
                ("gap", ""),
                ("h", "3. Autentikasi Dua Faktor"),
                ("b", "Wajib untuk email, VPN, dan sistem produksi."),
            ],
        },
        {
            "title": "Keamanan Informasi - Data",
            "subtitle": "Lanjutan Kebijakan Keamanan Informasi",
            "body": [
                ("h", "4. Klasifikasi Data"),
                ("b", "Publik: boleh dibagikan bebas."),
                ("b", "Internal: hanya untuk karyawan."),
                ("b", "Rahasia: akses berdasarkan kebutuhan (need to know)."),
                ("gap", ""),
                ("h", "5. Enkripsi"),
                ("b", "Data rahasia wajib dienkripsi saat disimpan dan dikirim."),
                ("b", "Standar enkripsi minimal AES-256."),
                ("gap", ""),
                ("h", "6. Perangkat"),
                ("b", "Enkripsi disk wajib pada semua laptop."),
                ("b", "Dilarang memasang perangkat lunak tanpa izin TI."),
            ],
        },
        {
            "title": "Keamanan Informasi - Insiden",
            "subtitle": "Lanjutan Kebijakan Keamanan Informasi",
            "body": [
                ("h", "7. Pelaporan Insiden"),
                ("b", "Laporkan dugaan kebocoran data dalam 1 jam pertama."),
                ("b", "Hubungi tim keamanan: security@nusantaradata.example."),
                ("gap", ""),
                ("h", "8. Audit"),
                ("b", "Audit keamanan dilakukan minimal 1 kali per tahun."),
                ("b", "Uji penetrasi dilakukan setiap 6 bulan."),
                ("gap", ""),
                ("h", "9. Sanksi"),
                ("b", "Pelanggaran kebijakan dapat berujung pemutusan hubungan kerja."),
            ],
        },
    ],
    "09-prosedur-penanganan-insiden.pdf": [
        {
            "title": "Prosedur Penanganan Insiden TI",
            "subtitle": "PT Nusantara Data - TI dan Operasi - Versi 1.9",
            "body": [
                ("h", "1. Definisi Insiden"),
                ("p", "Kejadian yang mengganggu atau berpotensi mengganggu layanan dan"),
                ("p", "keamanan informasi perusahaan."),
                ("gap", ""),
                ("h", "2. Tingkat Keparahan"),
                ("b", "P1 (kritis): layanan utama mati total."),
                ("b", "P2 (tinggi): layanan terganggu sebagian."),
                ("b", "P3 (sedang): gangguan terbatas, ada solusi sementara."),
                ("b", "P4 (rendah): gangguan kecil tanpa dampak signifikan."),
            ],
        },
        {
            "title": "Penanganan Insiden - Respons",
            "subtitle": "Lanjutan Prosedur Penanganan Insiden TI",
            "body": [
                ("h", "3. Waktu Respons"),
                ("b", "P1: respons maksimal 15 menit, target pulih 4 jam."),
                ("b", "P2: respons maksimal 1 jam, target pulih 8 jam."),
                ("b", "P3: respons maksimal 4 jam, target pulih 3 hari kerja."),
                ("gap", ""),
                ("h", "4. Alur Penanganan"),
                ("b", "Deteksi, lalu kategorikan tingkat keparahan."),
                ("b", "Eskalasi ke on-call engineer sesuai tingkat."),
                ("b", "Isolasi dan mitigasi dampak."),
                ("b", "Pemulihan layanan dan verifikasi."),
                ("b", "Post-mortem dalam 3 hari kerja."),
            ],
        },
        {
            "title": "Penanganan Insiden - Komunikasi",
            "subtitle": "Lanjutan Prosedur Penanganan Insiden TI",
            "body": [
                ("h", "5. Komunikasi"),
                ("b", "Pembaruan status setiap 30 menit untuk insiden P1."),
                ("b", "Kanal komunikasi utama: grup #insiden."),
                ("gap", ""),
                ("h", "6. Post-Mortem"),
                ("b", "Bersifat blameless (tanpa mencari kesalahan individu)."),
                ("b", "Wajib memuat akar masalah dan tindakan pencegahan."),
                ("b", "Dokumen post-mortem disimpan minimal 2 tahun."),
            ],
        },
    ],
    # ----------------------------------------------------------- KEUANGAN
    "10-laporan-keuangan-triwulan.pdf": [
        {
            "title": "Laporan Keuangan Triwulan III 2024",
            "subtitle": "PT Nusantara Data - Divisi Keuangan - Terbatas Internal",
            "body": [
                ("h", "1. Ringkasan Eksekutif"),
                ("p", "Perusahaan membukukan pertumbuhan pendapatan yang sehat pada"),
                ("p", "triwulan III 2024 dengan margin operasional yang membaik."),
                ("gap", ""),
                ("h", "2. Pendapatan"),
                ("b", "Pendapatan triwulan III: Rp 12.400.000.000."),
                ("b", "Pertumbuhan dibanding triwulan II: 14 persen."),
                ("b", "Kontribusi terbesar dari segmen enterprise: 62 persen."),
                ("gap", ""),
                ("h", "3. Beban"),
                ("b", "Total beban operasional: Rp 9.100.000.000."),
                ("b", "Beban gaji dan tunjangan: Rp 5.200.000.000."),
            ],
        },
        {
            "title": "Laporan Keuangan - Laba dan Rasio",
            "subtitle": "Lanjutan Laporan Keuangan Triwulan III 2024",
            "body": [
                ("h", "4. Laba"),
                ("b", "Laba operasional: Rp 3.300.000.000."),
                ("b", "Laba bersih: Rp 2.450.000.000."),
                ("b", "Margin laba bersih: 19,8 persen."),
                ("gap", ""),
                ("h", "5. Arus Kas"),
                ("b", "Arus kas operasi: Rp 2.900.000.000."),
                ("b", "Saldo kas akhir periode: Rp 8.750.000.000."),
                ("gap", ""),
                ("h", "6. Rasio Keuangan"),
                ("b", "Rasio lancar (current ratio): 2,4."),
                ("b", "Rasio utang terhadap ekuitas (DER): 0,6."),
            ],
        },
        {
            "title": "Laporan Keuangan - Catatan",
            "subtitle": "Lanjutan Laporan Keuangan Triwulan III 2024",
            "body": [
                ("h", "7. Proyeksi"),
                ("b", "Target pendapatan tahunan: Rp 48.000.000.000."),
                ("b", "Perkiraan pertumbuhan tahunan: 18 persen."),
                ("gap", ""),
                ("h", "8. Catatan Penting"),
                ("b", "Laporan belum diaudit oleh auditor eksternal."),
                ("b", "Audit tahunan dijadwalkan pada Februari 2025."),
                ("gap", ""),
                ("h", "9. Kontak"),
                ("b", "Pertanyaan keuangan: finance@nusantaradata.example."),
            ],
        },
    ],
}

def main() -> int:
    out_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else (
        Path(__file__).resolve().parent / "library"
    )
    out_dir.mkdir(parents=True, exist_ok=True)
    total_pages = 0
    for name, pages in DOCS.items():
        path = out_dir / name
        path.write_bytes(build_pdf(pages))
        total_pages += len(pages)
        print(f"wrote {path.name} ({len(pages)} pages, {path.stat().st_size} bytes)")
    print(f"\n{len(DOCS)} documents, {total_pages} pages -> {out_dir}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
