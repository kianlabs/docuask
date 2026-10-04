# Launch Kit — DocuAsk

Materi siap pakai untuk merilis dan mempromosikan DocuAsk. Salin, sesuaikan
nama/harga, lalu posting.

---

## 1. One-liner & deskripsi

**Tagline (≤ 60 char):**
> Tanya PDF-mu, dapat jawaban bersitasi halaman.

**One-liner:**
> DocuAsk membuat PDF jadi bisa ditanya. Unggah dokumen, ajukan pertanyaan,
> dan dapat jawaban yang menunjuk halaman sumbernya.

**Short description (~50 kata):**
> DocuAsk adalah asisten dokumen untuk tim. Unggah PDF — kebijakan, kontrak,
> SOP — lalu tanya dengan bahasa sehari-hari. Setiap jawaban disertai rujukan
> halaman, jadi bisa kamu cek sendiri. Kalau jawabannya tidak ada di dokumen,
> DocuAsk bilang tidak ada, bukan mengarang.

**Long description (paragraf):**
> Mencari satu angka di tumpukan PDF itu melelahkan: buka berkas, Ctrl+F,
> salah kata kunci, ulang lagi. DocuAsk menghilangkan langkah itu. Unggah
> dokumenmu, lalu bertanya seperti ke rekan kerja — "berapa jatah cuti
> tahunan?", "apa syarat pembayaran di kontrak ini?". Jawabannya langsung,
> disertai nomor halaman yang bisa kamu buka untuk memverifikasi.
>
> Yang membedakan DocuAsk: jawaban hanya diambil dari dokumenmu, bukan dari
> internet, dan selalu menunjuk sumbernya. Kalau informasinya tidak ada,
> DocuAsk mengatakannya dengan jujur. Cocok untuk HR, legal, tim operasi, dan
> siapa pun yang bekerja dengan dokumen setiap hari.

---

## 2. Positioning & target

**Untuk siapa:**
- Tim HR yang sering ditanya kebijakan yang sama.
- Tim legal/operasi yang menelusuri kontrak dan SOP.
- Peneliti & konsultan yang bekerja dengan banyak PDF.

**Masalah:** pencarian manual di PDF lambat dan mudah melewatkan halaman penting.
**Solusi:** tanya-jawab bahasa natural dengan sitasi halaman yang bisa diverifikasi.
**Pembeda:** (1) jawaban hanya dari dokumenmu, (2) selalu bersitasi, (3) jujur
saat jawaban tidak ada, (4) dokumen terpisah per akun.

**Bukan untuk:** OCR gambar/scan tanpa lapisan teks, atau analisis dokumen
raksasa jutaan berkas.

---

## 3. Post LinkedIn

> Satu pertanyaan sederhana yang sering bikin repot tim: "aturan cutinya di
> dokumen yang mana ya?"
>
> Biasanya jawabannya: buka PDF, Ctrl+F, coba beberapa kata kunci, lalu menyerah
> dan tanya orang lain.
>
> Kami membuat DocuAsk untuk itu. Unggah PDF-nya, tanya pakai bahasa
> sehari-hari, dan jawabannya datang lengkap dengan nomor halaman sumbernya.
>
> Dua hal yang kami pegang:
> • Jawaban hanya diambil dari dokumenmu — bukan dari internet.
> • Kalau jawabannya tidak ada, DocuAsk bilang tidak ada. Bukan mengarang.
>
> Gratis untuk mulai, tanpa kartu kredit. Coba di [link].
>
> #AI #produktivitas #dokumen #SaaS #Indonesia

---

## 4. Post X / Twitter

> Cari satu angka di tumpukan PDF:
> buka → Ctrl+F → salah kata kunci → ulang → nyerah.
>
> DocuAsk: unggah PDF, tanya, dapat jawaban + nomor halamannya.
>
> Jawaban cuma dari dokumenmu. Kalau nggak ada, ya bilang nggak ada.
> Gratis → [link]

---

## 5. Post Instagram / TikTok (script 20 detik)

**Hook (0–3 dtk, layar rekam aplikasi):**
> "Berapa jatah cuti tahunan?" — dan jawabannya muncul dengan nomor halaman.

**Isi (3–15 dtk):**
> Nggak perlu buka PDF dan Ctrl+F. Unggah dokumen, tanya pakai bahasa
> sehari-hari, jawabannya menunjuk halaman sumbernya. Jawaban cuma diambil dari
> dokumenmu — bukan dari internet.

**CTA (15–20 dtk):**
> DocuAsk. Gratis untuk mulai. Link di bio.

**Caption:**
> Bikin PDF-mu bisa ditanya. Jawaban selalu bersitasi halaman, jadi bisa kamu
> cek sendiri. Gratis untuk mulai 🔗 link di bio.
> #AI #produktivitas #dokumen #belajardiproduktif

---

## 6. Post komunitas (Reddit / forum / grup)

> **Judul:** Saya bikin alat untuk tanya-jawab dokumen yang selalu tunjuk halaman sumber
>
> Sering kesulitan cari info di tumpukan PDF (kontrak, kebijakan, SOP), jadi
> saya bikin DocuAsk. Alurnya sederhana: unggah PDF, tanya, dapat jawaban +
> nomor halaman yang bisa diklik.
>
> Yang saya tekankan: jawaban hanya diambil dari dokumen yang diunggah, bukan
> dari internet, dan kalau informasinya tidak ada, alat ini mengatakannya
> (bukan mengarang). Ada paket gratis kalau mau coba. Masukan sangat
> diterima — terutama soal kasus pakai yang belum kepikiran.

---

## 7. Email pengumuman (ke daftar tunggu / pelanggan)

**Subjek:** DocuAsk siap dipakai — tanya apa pun ke dokumenmu

> Hai,
>
> DocuAsk sudah bisa dipakai. Unggah PDF-mu, ajukan pertanyaan, dan dapat
> jawaban yang menunjuk halaman sumbernya — jadi kamu selalu bisa memeriksa.
>
> Yang perlu kamu tahu:
> • Jawaban hanya diambil dari dokumenmu, bukan dari internet.
> • Kalau jawabannya tidak ada di dokumen, DocuAsk bilang tidak ada.
> • Dokumenmu terpisah dari akun lain.
> • Mulai gratis, tanpa kartu kredit.
>
> Coba di [link]. Kalau ada pertanyaan atau masukan, cukup balas email ini.
>
> Salam,
> [Nama]

---

## 8. Checklist rilis

- [ ] Set `NEXT_PUBLIC_SITE_URL` ke domain publik.
- [ ] Deploy (lihat `DEPLOY.md`), pastikan `/api/health` → `{"ok":true}`.
- [ ] Ganti semua secret contoh dengan nilai acak (`openssl rand -hex 32`).
- [ ] Cek `/robots.txt` dan `/sitemap.xml` memakai domain yang benar.
- [ ] Uji pratinjau tautan (OG image) di WhatsApp/LinkedIn/X.
- [ ] Tambahkan domain ke Google Search Console, kirim `sitemap.xml`.
- [ ] Siapkan akun demo + satu PDF contoh untuk calon pengguna.
- [ ] Pasang uptime monitor ke `/api/health`.
- [ ] Siapkan balasan untuk pertanyaan umum (lihat FAQ di landing).
