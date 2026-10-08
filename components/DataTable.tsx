"use client";
import { useState } from "react";
import type { Row } from "@/lib/sheets";
import Sticker from "@/components/Sticker";

export default function DataTable({
  cols,
  rows,
  head,
  sticker,
  emptySticker = false,
}: {
  cols: { key: string; label: string }[];
  rows: Row[];
  head: string; // kelas warna header, mis. "bg-navy-900 text-white"
  sticker?: React.ReactNode; // stiker di samping kolom cari
  emptySticker?: boolean; // tampilkan maskot "Belum ada data" saat tabel kosong (maks. satu stiker per layar)
}) {
  const [q, setQ] = useState("");
  const shown = q ? rows.filter((r) => Object.values(r).some((v) => v.toLowerCase().includes(q.toLowerCase()))) : rows;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari di tabel..."
          aria-label="Cari di tabel"
          className="w-full max-w-xs rounded-lg border border-sea-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea-500"
        />
        {sticker}
      </div>
      {shown.length === 0 ? (
        !rows.length && emptySticker ? (
          <div className="flex items-center gap-4 rounded-xl bg-white/75 p-5 text-sm text-slate-600 backdrop-blur-md">
            <Sticker name="belum-ada-data" size={120} />
            <p>Laporan dari Google Form akan muncul di sini setelah ada yang mengisi.</p>
          </div>
        ) : (
          <p className="rounded-xl bg-white/75 p-6 text-sm backdrop-blur-md">{rows.length ? "Tidak ada yang cocok." : "Belum ada data."}</p>
        )
      ) : (
        <div className="max-h-[70vh] overflow-auto rounded-xl border border-white/60 bg-white/75 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <table className="w-full text-left text-sm">
            <thead className={`sticky top-0 ${head}`}>
              <tr>
                {cols.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={i} className="border-t border-black/5 transition-colors even:bg-sea-50/50 hover:bg-sea-100">
                  {cols.map((c) => (
                    <td key={c.key} className="px-4 py-3">{r[c.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-navy-700">{shown.length} baris</p>
    </div>
  );
}
