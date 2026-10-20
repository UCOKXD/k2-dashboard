"use client";
import { useId, useState } from "react";
import { Search } from "lucide-react";
import type { Row } from "@/lib/sheets";
import Sticker from "@/components/Sticker";

const NUM = /^-?\d+([.,]\d+)?$/;

// Tabel data v2: kolom cari + penghitung baris, kepala mono, kolom angka rata kanan.
// Di layar <=720px tiap baris jadi kartu bertumpuk "LABEL — nilai" (lihat .k2-tbl di globals.css).
export default function DataTable({
  cols,
  rows,
  sticker,
  emptySticker = false,
  label = "tabel",
}: {
  cols: { key: string; label: string }[];
  rows: Row[];
  head?: string; // (lama) warna kepala tabel; desain v2 memakai satu gaya untuk semua tabel
  sticker?: React.ReactNode; // stiker di samping kolom cari
  emptySticker?: boolean; // tampilkan maskot "Belum ada data" saat tabel kosong (maks. satu stiker per layar)
  label?: string; // nama tabel untuk pembaca layar, mis. "daftar izin"
}) {
  const [q, setQ] = useState("");
  const id = useId();
  const shown = q ? rows.filter((r) => Object.values(r).some((v) => v.toLowerCase().includes(q.toLowerCase()))) : rows;
  const numeric = new Set(cols.filter((c) => rows.length > 0 && rows.every((r) => !r[c.key] || NUM.test(r[c.key].trim()))).map((c) => c.key));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative block w-full max-w-[360px]">
          <span className="sr-only">Cari di {label}</span>
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari di tabel…"
            aria-controls={id}
            className="min-h-[46px] w-full rounded-full border border-line-strong bg-surface pl-[42px] pr-4 text-[15px] text-ink outline-none transition placeholder:text-ink-3 hover:border-ink-3 focus:border-sea-500 focus:shadow-[0_0_0_3px_rgba(46,155,224,0.25)]"
          />
        </label>
        {sticker}
      </div>
      {shown.length === 0 ? (
        !rows.length && emptySticker ? (
          <div className="k2-card flex items-center gap-4 p-5 text-sm text-ink-2">
            <Sticker name="belum-ada-data" size={120} />
            <p>Laporan dari Google Form akan muncul di sini setelah ada yang mengisi.</p>
          </div>
        ) : (
          <p className="k2-card p-6 text-center text-sm text-ink-3">{rows.length ? "Tidak ada yang cocok." : "Belum ada data."}</p>
        )
      ) : (
        <div id={id} className="max-h-[70vh] overflow-auto rounded-k2-lg border border-line bg-surface shadow-1">
          <table className="k2-tbl">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c.key} scope="col" className={numeric.has(c.key) ? "num" : undefined}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c.key} data-label={c.label} className={numeric.has(c.key) ? "num" : undefined}>
                      {r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="font-mono text-xs text-ink-3" aria-live="polite">
        {shown.length} baris
      </p>
    </div>
  );
}
