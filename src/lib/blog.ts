/**
 * Blog content for the public site.
 *
 * Posts are plain data — no MDX, no markdown parser, no raw HTML. Each body is
 * a list of sections so the renderer stays a simple, typed map over
 * `heading` + `paragraphs` + optional `bullets`. Keeping content here (rather
 * than in each page) means the index, the article routes, the sitemap and the
 * JSON-LD all read from one source.
 *
 * Copy rules: only describe behaviour that DocuAsk actually has (every answer
 * carries a page citation; when the answer is absent it says so). No invented
 * statistics, customers, or sources.
 */

export type BlogSection = {
  /** Optional section heading; rendered as an <h2>. */
  heading?: string;
  paragraphs: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  /** SEO meta description, roughly 140 characters. */
  description: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Honest reading estimate in minutes (~200 words per minute). */
  readingMinutes: number;
  tags: string[];
  body: BlogSection[];
};

export const POSTS: BlogPost[] = [
  {
    slug: "memeriksa-jawaban-ai-ke-dokumen",
    title: "Cara memeriksa jawaban AI ke dokumen",
    description:
      "Setiap jawaban DocuAsk menunjuk halaman sumbernya. Pelajari cara memeriksa sitasi dan mengenali penolakan yang jujur.",
    date: "2026-09-22",
    readingMinutes: 3,
    tags: ["Sitasi", "Verifikasi", "Cara pakai"],
    body: [
      {
        heading: "Sitasi adalah titik awal, bukan jaminan",
        paragraphs: [
          "DocuAsk menjawab pertanyaan hanya dari dokumen yang kamu unggah. Setiap jawaban yang memuat fakta membawa penanda halaman, misalnya [page 3], yang menunjuk halaman tempat informasi itu diambil. Penanda ini bukan hiasan: ia memberi tahu kamu dari mana kalimat itu berasal, sehingga kamu tidak perlu mempercayai jawaban begitu saja.",
          "Namun sitasi tidak membuat jawaban otomatis benar. Model bahasa bisa salah membaca tabel, salah menafsirkan kalimat bersyarat, atau menggabungkan dua aturan yang sebenarnya terpisah menjadi satu kesimpulan. Karena itu, baca sitasi sebagai undangan untuk memeriksa, bukan sebagai stempel bahwa jawabannya sudah terverifikasi. Bedanya penting: satu menuntun kamu ke bukti, yang lain memintamu berhenti bertanya.",
        ],
      },
      {
        heading: "Cara memeriksa halaman yang disitir",
        paragraphs: [
          "Buka PDF-nya, lompat ke halaman yang disebut, lalu baca bagian yang relevan. Tujuannya bukan sekadar memastikan halaman itu ada, melainkan memastikan isinya benar-benar mendukung kalimat yang kamu baca. Ada tiga hal yang perlu kamu pastikan:",
        ],
        bullets: [
          "Apakah halaman itu benar-benar memuat angka, tanggal, atau aturan yang disebut jawaban?",
          "Apakah jawabannya mewakili keseluruhan kalimat, atau hanya potongan yang diambil di luar konteksnya?",
          "Apakah ada syarat atau pengecualian di dekatnya yang mengubah arti bagian tersebut?",
        ],
      },
      {
        heading: "Membaca hasil pemeriksaan",
        paragraphs: [
          "Kalau ketiga hal di atas cocok, jawaban itu bisa kamu pakai dan kamu tahu persis dasarnya. Kalau salah satu tidak cocok, kamu sudah punya pertanyaan lanjutan yang lebih tajam: sebutkan halaman dan kalimat yang membuatmu ragu, lalu minta DocuAsk menunjuk bagian yang lebih spesifik. Pertanyaan yang menyebut halaman cenderung menghasilkan jawaban yang lebih sempit dan lebih mudah diperiksa.",
          "Perlu diingat bahwa satu halaman sering memuat lebih dari satu aturan. Saat jawaban menggabungkan beberapa ketentuan, periksa setiap halaman yang disitir, bukan hanya yang pertama. Kalau dua halaman tampak bertentangan, itu justru sinyal berguna: mungkin ada aturan umum dan pengecualian yang perlu kamu baca bersama-sama.",
        ],
      },
      {
        heading: "Seperti apa penolakan yang bisa dipercaya",
        paragraphs: [
          "Sistem yang jujur harus berani mengatakan tidak tahu. Ketika informasi tidak ada di dalam dokumen, DocuAsk tidak mengarang jawaban. Ia menjawab persis: “Maaf, informasi itu tidak ada di dalam dokumen.” Kalimat itu berarti tidak ada bagian dokumen yang cukup relevan untuk dijadikan dasar, sehingga DocuAsk memilih tidak menjawab daripada menebak.",
          "Penolakan seperti ini berguna karena mencegah kamu memakai angka atau aturan yang tidak pernah tertulis di dokumen. Yang justru perlu kamu waspadai adalah kebalikannya: jawaban yang terdengar yakin, lengkap dengan angka, tetapi tidak menunjuk satu halaman pun. Tanpa rujukan, tidak ada yang bisa kamu periksa, dan kamu kembali bergantung pada tebakan.",
        ],
      },
      {
        heading: "Kebiasaan singkat yang bisa dipakai",
        paragraphs: [
          "Memeriksa jawaban tidak harus memakan banyak waktu. Beberapa kebiasaan sederhana sudah cukup untuk membuat hasilnya bisa dipertanggungjawabkan:",
        ],
        bullets: [
          "Buka minimal satu halaman yang disitir sebelum memakai jawabannya.",
          "Perlakukan penolakan sebagai jawaban yang sah, bukan kegagalan sistem.",
          "Kalau jawaban terasa terlalu umum, minta DocuAsk menunjuk klausul atau halaman yang lebih spesifik.",
          "Catat dokumen dan halaman yang kamu pakai, supaya bisa kamu tunjukkan lagi saat ditanya.",
        ],
      },
      {
        paragraphs: [
          "Dengan kebiasaan itu, memeriksa jawaban tidak lagi terasa seperti menebak. Kamu membaca jawaban, membuka halamannya, dan memutuskan sendiri apakah isinya benar. Itulah perbedaan antara mempercayai alat dan memverifikasi hasilnya.",
        ],
      },
    ],
  },
  {
    slug: "pertanyaan-yang-baik-untuk-dokumen-panjang",
    title: "Cara mengajukan pertanyaan yang baik ke dokumen panjang",
    description:
      "Pertanyaan yang spesifik menghasilkan jawaban bersitasi yang lebih mudah diperiksa. Pola bertanya untuk dokumen panjang, dengan contoh.",
    date: "2026-09-30",
    readingMinutes: 3,
    tags: ["Pertanyaan", "Dokumen panjang", "Cara pakai"],
    body: [
      {
        heading: "Mulai dari yang spesifik, bukan yang luas",
        paragraphs: [
          "Dokumen panjang seperti kontrak, kebijakan, atau laporan sering memuat jawaban yang tersebar di beberapa halaman. Pertanyaan yang terlalu luas, misalnya “jelaskan isi dokumen ini”, membuat jawaban ikut melebar dan sulit diperiksa. Sebaliknya, pertanyaan yang menyebut hal yang kamu cari menghasilkan jawaban yang lebih pendek dan lebih mudah ditelusuri.",
          "Cara paling sederhana adalah menyebut jenis informasi yang kamu butuhkan: klausul, angka, tanggal, nama pihak, atau syarat. Semakin jelas kamu menyebut bentuk jawabannya, semakin kecil ruang bagi jawaban untuk melebar ke hal-hal yang tidak kamu tanyakan.",
        ],
      },
      {
        heading: "Minta jawaban menunjuk bagian yang tepat",
        paragraphs: [
          "DocuAsk selalu berusaha menempelkan penanda halaman pada setiap fakta. Kamu bisa memanfaatkan itu dengan meminta bagian yang lebih spesifik. Bandingkan dua pertanyaan berikut, keduanya contoh ilustrasi, bukan isi dokumen nyata:",
        ],
        bullets: [
          "Umum: “Bagaimana aturan cuti di perusahaan ini?”",
          "Spesifik: “Berapa jatah cuti tahunan untuk karyawan tetap, dan di halaman mana aturan itu ditulis?”",
        ],
      },
      {
        heading: "Minta kutipan persis",
        paragraphs: [
          "Kalau kamu butuh kalimat yang persis, minta DocuAsk mengutipnya. Permintaan seperti “kutip kalimat yang menyebut masa percobaan” membantu kamu melihat redaksi aslinya, bukan parafrase. Kutipan berguna saat kamu perlu menyalin aturan ke dokumen lain atau membandingkan dua versi kebijakan, karena kata-kata aslinya sering menentukan arti.",
          "Ingat bahwa kutipan tetap harus kamu periksa di halaman yang disebut. Model bisa memilih kalimat yang benar tetapi memotongnya di tengah, sehingga bagian yang hilang justru mengubah artinya. Membuka halaman sumbernya adalah cara tercepat untuk memastikan kutipannya utuh.",
        ],
      },
      {
        heading: "Tanyakan apa yang tidak ada",
        paragraphs: [
          "Pertanyaan yang berguna tidak hanya mencari yang ada, tetapi juga memastikan yang tidak ada. Kamu bisa bertanya secara langsung, misalnya “apakah dokumen ini mengatur tunjangan transportasi?”. Kalau aturannya tidak ada, DocuAsk akan menjawab: “Maaf, informasi itu tidak ada di dalam dokumen.” Jawaban itu sama berharganya dengan jawaban yang bersitasi, karena ia mencegah kamu menganggap sesuatu diatur padahal tidak.",
          "Pola ini cocok dipakai sebelum mengambil keputusan. Daripada mengira-ngira apakah suatu hal sudah diatur, kamu menanyakannya dan mendapat jawaban yang bisa kamu pegang, baik berupa rujukan halaman maupun pernyataan bahwa hal itu memang tidak dibahas.",
        ],
      },
      {
        heading: "Beberapa pola pertanyaan yang bisa kamu tiru",
        paragraphs: [
          "Pola-pola berikut bisa langsung kamu pakai. Semua contoh di bawah bersifat ilustrasi, bukan kutipan dari dokumen nyata:",
        ],
        bullets: [
          "Minta angka: “Berapa lama masa percobaan, dan di halaman berapa disebutkan?”",
          "Minta syarat: “Syarat apa saja yang harus dipenuhi untuk mengajukan reimbursement?”",
          "Minta tanggal: “Kapan kebijakan ini mulai berlaku menurut dokumennya?”",
          "Minta kutipan: “Kutip kalimat yang mengatur pembagian tunjangan kesehatan.”",
          "Minta kepastian ketiadaan: “Apakah ada aturan soal kerja jarak jauh di dokumen ini?”",
        ],
      },
      {
        paragraphs: [
          "Tidak ada formula yang harus dihafal. Prinsipnya cuma satu: bertanyalah seolah kamu sedang menunjuk bagian tertentu di dokumen, bukan meminta ringkasan seluruhnya. Pertanyaan yang menunjuk akan selalu lebih mudah diperiksa daripada pertanyaan yang membuka.",
        ],
      },
    ],
  },
  {
    slug: "mengapa-sitasi-penting-untuk-hr",
    title: "Mengapa sitasi penting untuk tim HR",
    description:
      "Mengapa rujukan halaman penting bagi tim HR: pertanyaan karyawan yang berulang, kebijakan yang berubah tiap tahun, dan sengketa yang butuh sumber jelas.",
    date: "2026-10-04",
    readingMinutes: 2,
    tags: ["HR", "Kebijakan", "Sitasi"],
    body: [
      {
        heading: "Pertanyaan karyawan yang datang berulang",
        paragraphs: [
          "Sebagian besar pertanyaan ke tim HR adalah pertanyaan yang sama, diajukan berkali-kali: jatah cuti, cara mengajukan reimbursement, syarat masa percobaan, atau tunjangan yang berlaku untuk keluarga. Jawabannya sebenarnya sudah tertulis di kebijakan, SOP, atau kontrak. Yang hilang bukan isinya, melainkan cara menemukannya dengan cepat.",
          "Ketika jawaban dicari manual, setiap pertanyaan memaksa seseorang membuka ulang PDF dan menelusuri halaman. DocuAsk mempersingkat langkah itu: pertanyaan dijawab dari dokumen yang berlaku, dan setiap jawaban menunjuk halaman sumbernya. Tim HR tidak lagi menghafal letak setiap aturan, tetapi tetap bisa menunjukkan dasarnya.",
        ],
      },
      {
        heading: "Kebijakan yang berubah tiap tahun",
        paragraphs: [
          "Kebijakan perusahaan jarang tetap. Jatah cuti, besaran tunjangan, dan prosedur pengajuan bisa diperbarui setiap tahun, dan versi lama sering masih tersimpan di banyak tempat. Risiko terbesarnya bukan lupa memperbarui dokumen, melainkan menjawab karyawan memakai salinan lama tanpa sadar.",
          "Karena jawaban DocuAsk diambil dari dokumen yang kamu unggah, versi yang berlaku adalah versi yang ada di dokumen itu. Ketika kebijakan berganti, kamu mengunggah versi barunya, dan jawaban berikutnya mengikuti dokumen terbaru. Rujukan halaman membuat perbedaan versi mudah dilihat: kalau halaman yang disitir tidak lagi memuat aturan itu, kamu tahu dokumen yang dipakai sudah tidak sesuai.",
        ],
      },
      {
        heading: "Halaman yang menyelesaikan perdebatan",
        paragraphs: [
          "Ada kalanya karyawan dan HR membaca aturan yang sama dengan kesimpulan berbeda. Di titik ini, penjelasan ulang tidak banyak menolong; yang menolong adalah rujukan ke halaman tertentu. Kalimat seperti “aturannya ada di halaman 4, paragraf kedua” mengubah percakapan dari saling meyakinkan menjadi sama-sama melihat sumber yang sama.",
          "Rujukan halaman juga melindungi tim HR. Ketika keputusan dipertanyakan di kemudian hari, jawaban yang bisa ditelusuri ke dokumen resmi jauh lebih kuat daripada jawaban yang hanya mengandalkan ingatan. Sitasi membuat setiap jawaban bisa diaudit, baik oleh karyawan maupun oleh manajemen.",
        ],
      },
      {
        heading: "Memakainya di tim HR",
        paragraphs: [
          "Tidak perlu mengubah seluruh alur kerja untuk mulai memakainya. Cukup jadikan dokumen resmi sebagai satu-satunya sumber pertanyaan, lalu biasakan membuka halaman yang disitir sebelum jawaban dikirim ke karyawan. Beberapa hal yang membantu:",
        ],
        bullets: [
          "Unggah versi kebijakan yang paling baru, dan singkirkan salinan lama dari tempat tim biasa mencari.",
          "Saat menjawab pertanyaan karyawan, sertakan rujukan halaman yang disebut DocuAsk.",
          "Kalau DocuAsk menjawab bahwa informasinya tidak ada, perlakukan itu sebagai sinyal untuk memeriksa apakah kebijakannya memang belum diatur.",
          "Simpan pertanyaan yang paling sering muncul, supaya jawabannya bisa dipakai ulang dengan rujukan yang sama.",
        ],
      },
      {
        paragraphs: [
          "Sitasi bukan sekadar fitur teknis. Untuk tim HR, ia adalah cara membuat jawaban yang berulang tetap konsisten, dapat ditelusuri, dan mudah dipertanggungjawabkan ketika kebijakan terus berubah.",
        ],
      },
    ],
  },
];

/** Newest first, so indexes and feeds never need to re-sort. */
POSTS.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

/** Look up a single post by slug. Returns `undefined` for unknown slugs. */
export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug);
}

/** Format an ISO date as an Indonesian long date, e.g. "4 Oktober 2026". */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
