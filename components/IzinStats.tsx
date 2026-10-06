"use client";
import { useState } from "react";
import type { Count, IzinStatsData } from "@/lib/izin-stats";

// Satu seri per grafik = satu warna. Warna dipilih per halaman (accent), teks tetap memakai warna teks biasa.
const panel = "rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-md sm:p-6";

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className={panel}>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-4xl font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

// Batang horizontal: label di kiri, nilai di ujung batang, tooltip saat disorot.
function BarList({ title, data, accent, empty }: { title: string; data: Count[]; accent: string; empty: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <div className={panel}>
      <h3 className="mb-4 font-bold text-slate-800">{title}</h3>
      {data.length === 0 && <p className="text-sm text-slate-400">{empty}</p>}
      <ul className="space-y-2.5">
        {data.map((d, i) => (
          <li key={d.label} className="relative grid grid-cols-[9rem_1fr] items-center gap-3" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="truncate text-sm font-medium text-slate-700" title={d.sub ?? d.label}>
              {d.label}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-4 flex-1 rounded-r">
                <div
                  className={`h-4 rounded-r-[4px] transition-[width,opacity] duration-500 ${accent} ${hover !== null && hover !== i ? "opacity-40" : ""}`}
                  style={{ width: `${(d.n / max) * 100}%` }}
                />
              </div>
              <span className="w-7 shrink-0 text-right text-sm font-bold tabular-nums text-slate-700">{d.n}</span>
            </div>
            {hover === i && (
              <span className="pointer-events-none absolute -top-8 left-36 z-10 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-white shadow-lg">
                {d.sub ?? d.label}: {d.n} kali
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Kolom per bulan (6 bulan terakhir) dengan satu garis dasar.
function MonthColumns({ title, data, accent }: { title: string; data: Count[]; accent: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <div className={panel}>
      <h3 className="mb-4 font-bold text-slate-800">{title}</h3>
      <div className="flex h-44 items-end gap-3 border-b border-slate-200 px-1">
        {data.map((d, i) => (
          <div key={`${d.label}${d.sub}`} className="relative flex h-full flex-1 flex-col items-center justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="mb-1 text-xs font-bold tabular-nums text-slate-700">{d.n || ""}</span>
            <div
              className={`w-full max-w-6 rounded-t-[4px] transition-[height,opacity] duration-500 ${accent} ${hover !== null && hover !== i ? "opacity-40" : ""}`}
              style={{ height: `${(d.n / max) * 100}%`, minHeight: d.n ? 4 : 0 }}
            />
            {hover === i && (
              <span className="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-white shadow-lg">
                {d.label} {d.sub}: {d.n}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 px-1">
        {data.map((d) => (
          <span key={`${d.label}${d.sub}`} className="flex-1 text-center text-xs text-slate-500">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function IzinStats({ stats, accent, unit }: { stats: IzinStatsData; accent: string; unit: string }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile label={`Total ${unit}`} value={stats.total} />
        <Tile label={`${unit[0].toUpperCase()}${unit.slice(1)} bulan ini`} value={stats.monthTotal} />
        <Tile label="Jumlah siswa" value={stats.students} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title={`Siswa paling sering ${unit}`} data={stats.byName} accent={accent} empty="Belum ada data." />
        <MonthColumns title={`Jumlah ${unit} per bulan (6 bulan terakhir)`} data={stats.byMonth} accent={accent} />
      </div>
      {stats.byCategory.length > 0 && <BarList title={stats.categoryLabel} data={stats.byCategory} accent={accent} empty="Belum ada data." />}
    </div>
  );
}
