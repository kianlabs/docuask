# DocuAsk — Status

**v0.3 — multi-tenant + bge-m3 + Postgres/pgvector + billing. Terverifikasi 2026-10-04.**

## Verifikasi (fresh, app sebagai role non-superuser)

### Statis
| Cek | Hasil |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `CI=1 npm run lint` | No ESLint warnings or errors |
| `npm run build` (dev STOPPED) | Compiled, 10/10 pages |

### Fungsional
| Cek | Hasil |
|---|---|
| Embed provider | `cloudflare @cf/baai/bge-m3` (1024d) |
| Q&A | "3.20 dari skala 4.00 [page 2]" |
| POST tanpa key | 401 |
| POST key tak terdaftar | 401 |
| Tenant kosong tanya dokumen tenant lain | "tidak ada di dalam dokumen", 0 sitasi |
| RLS: cross-tenant read tanpa filter | 0 baris |

### Billing
| Cek | Hasil |
|---|---|
| `GET /api/usage` | plan, dok, tanya, sisa kuota |
| Upload 3 PDF (free 3/3) | 200, counter 3/3 |
| Upload ke-4 | **402** "Kuota dokumen habis (3/3)" |
| Tanya saat 50/50 (free) | **402** "Kuota pertanyaan habis (50/50)" |
| `POST /api/usage {planCode:pro}` (mock) | plan → pro, limit 50 |
| Upload setelah upgrade | 200, dok 4/50 |
| `GET /api/admin` tanpa token | 401 |
| `GET /api/admin` dengan token | 2 tenant + pemakaian |
| `usage_events` tercatat | ingest 4, question N |
| `POST /api/webhook/payment` tanpa/ salah signature | 401 |
| `POST /api/webhook/payment` signature sah + `settlement` | plan berubah |
| `POST /api/webhook/payment` signature sah + `pending` | `{ok,ignored}` |
| M1: `documents` dari tabel (bukan counter) | cocok dengan `COUNT(*)` nyata |

### RLS (7/7, setelah perbaikan NULLIF)
| Tes | Hasil |
|---|---|
| tanpa tenant context | 0 baris |
| `app.tenant_id = ''` | 0 baris (**bukan** error 22P02) |
| tenant2 baca doc tenant1 | 0 |
| tenant1 baca doc sendiri | 1 |
| tenant2 usage_counters (tanpa is_admin) | 1 (barisnya sendiri) |
| is_admin=on | 2 (semua) |
| is_admin=off + tenant | 1 |

### Anti-regresi pool
26 panggilan berurutan selang-seling `/api/usage` ⇄ `/api/admin` → **semua 200**
(sebelumnya selalu 500 saat berselang-seling).

## Arsitektur billing

- `plans`: free (3 dok / 50 tanya), pro (50 / 2000), bisnis (∞ / ∞)
- `tenants.plan_code` + `subscription_status` + `period_start`
- `usage_events` (log per operasi) + `usage_counters` (counter bulanan)
- Kuota dicek **sebelum** kerja (`assertQuota`), dicatat **sesudah** sukses (`recordUsage`)
- Pertanyaan yang ditolak retrieval-floor **tidak dihitung** (tidak ada biaya LLM)
- `/admin` + `/api/admin` digerbangi `ADMIN_TOKEN` (fail-closed kalau kosong)
- Admin lintas-tenant lewat flag RLS `app.is_admin` (koneksi non-superuser tetap aman)

## PITFALL KRITIS

1. **RLS di-bypass superuser.** App WAJIB role non-superuser (`docuask_app`).
2. **`FORCE ROW LEVEL SECURITY` wajib** selain `ENABLE`.
3. **`current_setting(x, true)::int` GAGAL `22P02` kalau nilainya `''`.**
   Pool koneksi yang dipakai ulang bisa menyisakan `''`. Selalu tulis
   `NULLIF(current_setting(x, true), '')::int`. Tanpa ini, endpoint admin
   error 500 hanya saat berselang-seling dengan endpoint tenant.
4. **`docker exec psql <<SQL` (heredoc bersarang) GAGAL DIAM-DIAM.** Tidak ada
   error, tapi SQL tidak dijalankan. Selalu tulis SQL ke file lalu
   `psql -f /tmp/file.sql`. Ini menggigit dua kali.
5. **Ubah `.env.local` butuh RESTART** proses Next.
6. **Jangan `npm run build` saat dev hidup** — `.next/` tabrakan.
7. **`EADDRINUSE`**: kill `next-server` berdasarkan cwd, bukan PID induk.
8. **GET `/api/chat` tidak lagi publik.** Konfigurasi LLM/embed hanya untuk
   tenant terautentikasi, atau bila `EXPOSE_PUBLIC_DIAGNOSTICS=1`. Respons
   anonim = `{ok:true,authenticated:false}` tanpa kunci `llm`/`embed`.
9. **Perhatikan plan saat uji kuota** — setelah upgrade ke pro, limit jadi 2000;
   set 50 tidak akan melewati batas. Set plan free dulu.

## Jalankan

```bash
cd ~/Projects/docuask
export PATH="$HOME/.local/share/mise/installs/node/22.23.3/bin:$PATH"
set -a && . ./.env.local && set +a
npx next dev -p 3005     # http://localhost:3005 | /admin
```

Setup DB (sekali): `sql/schema.sql`, `sql/roles.sql`, `sql/billing.sql` —
selalu lewat `psql -f`, bukan heredoc.

## Roadmap sisa

- ~~Gerbang pembayaran asli (Midtrans/Xendit)~~ — **SELESAI**: `POST
  /api/webhook/payment` verifikasi HMAC-SHA256 (`x-payment-signature`,
  `PAYMENT_WEBHOOK_SECRET`, fail-closed 503) lalu `upgradePlan()`. Mock
  `/api/usage` diblokir di produksi kecuali `ALLOW_MOCK_UPGRADE=1`.
- Login admin sungguhan (ganti `ADMIN_TOKEN` dengan role terautentikasi)
- Billing otomatis bulanan (cron yang menutup periode & menagih)
- OCR untuk PDF scan (kini ditolak 422)
- Deploy

## Hardening (v0.3)

- **unpdf 0.12.1 → 1.8.1** (40 paket dependensi dihapus). `npm audit --omit=dev`
  turun dari 6 → 2 kerentanan; sisa 2 = postcss/next, perbaikan butuh
  `next@16` (breaking) — sengaja tidak diambil.
- **M1**: kuota dokumen dihitung dari `COUNT(*)` tabel `documents` (source of
  truth), bukan `usage_counters.documents` — counter tidak bisa lagi menyimpang
  dari data nyata. `usage_counters.documents` kini informasional.
- **M5**: `ADMIN_TOKEN` dibandingkan dengan `crypto.timingSafeEqual`.
- **H3**: lihat PITFALL #8.
- **LOW**: `pool()` menolak jalan tanpa `DATABASE_URL` (tidak ada password
  default tertanam); peringatan sekali bila `LLM_BASE_URL` memakai http:// di
  produksi.
