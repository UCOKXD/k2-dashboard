"use client";
import { useState } from "react";
import type { Row } from "@/lib/sheets";

export default function DataTable({
  cols,
  rows,
  head,
}: {
  cols: { key: string; label: string }[];
  rows: Row[];
  head: string; // kelas warna header, mis. "bg-navy-900 text-white"
}) {
  const [q, setQ] = useState("");
  const shown = q ? rows.filter((r) => Object.values(r).some((v) => v.toLowerCase().includes(q.toLowerCase()))) : rows;

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari di tabel..."
        className="w-full max-w-xs rounded-lg border border-sea-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea-500"
      />
      {shown.length === 0 ? (
        <p className="rounded-xl bg-white/75 p-6 text-sm backdrop-blur-md">{rows.length ? "Tidak ada yang cocok." : "Belum ada data."}</p>
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
