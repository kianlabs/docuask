#!/usr/bin/env python3
"""Generate a small multi-page sample PDF with a real text layer.

No third-party dependencies (no reportlab/fpdf). DocuAsk extracts text with
`unpdf`, which does NOT OCR, so the PDF must contain an actual text layer --
this script writes one using the base-14 Helvetica font and WinAnsi encoding.

Usage:
    python3 samples/make_sample_pdf.py [output.pdf]

Default output: samples/kebijakan-cuti-contoh.pdf
"""

import sys
import zlib
from pathlib import Path

# --- Page geometry (US Letter, 72 dpi) ---
W, H = 612, 792
MARGIN_X, TOP_Y = 72, 720
LEADING = 16.0  # baseline-to-baseline for body text

# Content is ASCII-only so WinAnsiEncoding is trivially safe.
PAGES = [
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
]


def esc(s: str) -> str:
    """Escape PDF string special characters (ASCII content only)."""
    return s.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def content_stream(page: dict) -> bytes:
    """Build the page content stream (text operators)."""
    lines = ["BT", "/F1 20 Tf", f"1 0 0 1 {MARGIN_X} {TOP_Y} Tm"]
    # Title
    lines.append(f"({esc(page['title'])}) Tj")
    # Subtitle
    lines.append("0 -24 Td /F1 11 Tf")
    lines.append(f"({esc(page['subtitle'])}) Tj")
    # Body
    y_gap = -34
    for kind, text in page["body"]:
        if kind == "gap":
            lines.append(f"0 -10 Td")
            continue
        if kind == "h":
            lines.append(f"0 {y_gap} Td /F1 14 Tf")
            y_gap = -22
        elif kind == "b":
            lines.append(f"0 {y_gap} Td /F1 12 Tf")
            y_gap = -18
            text = "- " + text
        else:  # paragraph
            lines.append(f"0 {y_gap} Td /F1 12 Tf")
            y_gap = -18
        lines.append(f"({esc(text)}) Tj")
    lines.append("ET")
    return ("\n".join(lines) + "\n").encode("latin-1")


def build_pdf(pages) -> bytes:
    # Object numbering: 1 = Catalog, 2 = Pages, 3 = Font,
    # then for each page: content stream + page object.
    n_pages = len(pages)
    first_page_obj = 4
    page_obj_ids = [first_page_obj + 2 * i + 1 for i in range(n_pages)]
    content_obj_ids = [first_page_obj + 2 * i for i in range(n_pages)]

    objs = {}

    objs[1] = b"<< /Type /Catalog /Pages 2 0 R >>"
    kids = " ".join(f"{pid} 0 R" for pid in page_obj_ids)
    objs[2] = f"<< /Type /Pages /Count {n_pages} /Kids [{kids}] >>".encode()

    # Font object (base-14 Helvetica with WinAnsiEncoding -> latin-1 bytes)
    objs[3] = (
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica "
        b"/Encoding /WinAnsiEncoding >>"
    )

    for i, page in enumerate(pages):
        raw = content_stream(page)
        comp = zlib.compress(raw, 9)
        cid = content_obj_ids[i]
        pid = page_obj_ids[i]
        objs[cid] = (
            f"<< /Length {len(comp)} /Filter /FlateDecode >>".encode()
            + b"\nstream\n"
            + comp
            + b"\nendstream"
        )
        objs[pid] = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {W} {H}] "
            f"/Resources << /Font << /F1 3 0 R >> >> "
            f"/Contents {cid} 0 R >>"
        ).encode()

    # Serialize with a correct cross-reference table.
    max_obj = max(objs)
    out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = {}
    for oid in range(1, max_obj + 1):
        offsets[oid] = len(out)
        out += f"{oid} 0 obj\n".encode() + objs[oid] + b"\nendobj\n"

    xref_pos = len(out)
    out += f"xref\n0 {max_obj + 1}\n".encode()
    out += b"0000000000 65535 f \n"
    for oid in range(1, max_obj + 1):
        out += f"{offsets[oid]:010d} 00000 n \n".encode()
    out += (
        f"trailer\n<< /Size {max_obj + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_pos}\n%%EOF\n"
    ).encode()
    return bytes(out)


def main() -> int:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else (
        Path(__file__).resolve().parent / "kebijakan-cuti-contoh.pdf"
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(build_pdf(PAGES))
    print(f"wrote {out} ({out.stat().st_size} bytes, {len(PAGES)} pages)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
