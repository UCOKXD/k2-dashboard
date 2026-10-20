"use client";
import { useState } from "react";
import type { Count, IzinStatsData } from "@/lib/izin-stats";

// Grafik div + flex (tanpa pustaka). Desain v2: satu seri = sea-600, bulan berjalan navy (gelap: sea-300),
// "Lainnya" abu tinta. Kelas warnanya ada di app/globals.css (.k2-bar).
const panel = "k2-card min-w-0 p-5 sm:p-6";

export type StatItem = { label: string; value: number | string; unit?: string; sub?: string; bad?: boolean };

// Tiga angka dalam satu kartu bersekat.
export function StatGroup({ items }: { items: StatItem[] }) {
  return (
    <div className="k2-stats" style={{ "--n": items.length } as React.CSSProperties}>
      {items.map((s) => (
        <div key={s.label} className={`k2-stat ${s.bad ? "k2-stat--bad" : ""}`}>
          <p className="k2-stat__label">{s.label}</p>
          <p className="k2-stat__nilai">
            {s.value}
            {s.unit && <small className="ml-1 font-sans text-[15px] font-medium tracking-normal text-ink-3">{s.unit}</small>}
          </p>
          {s.sub && <p className="k2-stat__sub">{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}

function Tip({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-k2-md bg-navy-950 px-2.5 py-1 font-mono text-xs text-white shadow-3 ${className}`}>{children}</span>;
}

// Batang horizontal: label di kiri, nilai di kanan, tooltip saat disorot.
// footer = isi tambahan di bawah grafik.
export function BarList({ title, data, empty, footer }: { title: string; data: Count[]; empty: string; footer?: React.ReactNode }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <div className={panel}>
      <h3 className="mb-5 text-lg font-bold sm:text-xl">{title}</h3>
      {data.length === 0 && <p className="text-sm text-ink-3">{empty}</p>}
      <ul className="flex flex-col gap-3.5">
        {data.map((d, i) => (
          <li
            key={d.label}
            className="relative grid grid-cols-[minmax(96px,38%)_minmax(0,1fr)_32px] items-center gap-3 text-sm"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="truncate font-medium text-ink-2" title={d.sub ?? d.label}>
              {d.label}
            </span>
            <span className="h-3 overflow-hidden rounded-[6px] bg-surface-2">
              <span
                className={`block h-full rounded-[6px] transition-[width,opacity] duration-500 ${d.label === "Lainnya" ? "k2-bar--lain" : "k2-bar"} ${hover !== null && hover !== i ? "opacity-40" : ""}`}
                style={{ width: `${(d.n / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono text-[13px] font-semibold text-ink">{d.n}</span>
            {hover === i && (
              <Tip className="-top-8 left-24">
                {d.sub ?? d.label}: {d.n} kali
              </Tip>
            )}
          </li>
        ))}
      </ul>
      {footer}
    </div>
  );
}

// Kolom per bulan (6 bulan terakhir) dengan garis bantu; batang terakhir = bulan berjalan.
export function MonthColumns({ title, data, empty }: { title: string; data: Count[]; empty?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.n));
  const none = data.every((d) => !d.n);
  return (
    <div className={panel}>
      <h3 className="mb-5 text-lg font-bold sm:text-xl">{title}</h3>
      <div
        className="relative flex h-48 items-end gap-[clamp(8px,2vw,18px)] border-b border-line-strong px-1"
        style={{ backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px)", backgroundSize: "100% 50%" }}
      >
        {none && empty && <p className="absolute inset-0 grid place-items-center text-sm text-ink-3">{empty}</p>}
        {data.map((d, i) => (
          <div
            key={`${d.label}${d.sub}`}
            className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="font-mono text-xs font-semibold text-ink-2">{d.n || ""}</span>
            <div
              className={`w-full max-w-11 rounded-t-[4px] transition-[height,opacity] duration-500 ${i === data.length - 1 ? "k2-bar--now" : "k2-bar"} ${hover !== null && hover !== i ? "opacity-40" : ""}`}
              style={{ height: `${(d.n / max) * 82}%`, minHeight: d.n ? 4 : 0 }}
            />
            {hover === i && (
              <Tip className="-top-7">
                {d.label} {d.sub}: {d.n}
              </Tip>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[clamp(8px,2vw,18px)] px-1">
        {data.map((d, i) => (
          <span key={`${d.label}${d.sub}`} className={`min-w-0 flex-1 text-center font-mono text-xs ${i === data.length - 1 ? "font-bold text-ink" : "text-ink-3"}`}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const bulanIni = () => new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", month: "long", year: "numeric" });

export default function IzinStats({ stats, unit }: { stats: IzinStatsData; unit: string }) {
  return (
    <div className="space-y-5">
      <StatGroup
        items={[
          { label: `Total ${unit}`, value: stats.total, sub: "Semua data di spreadsheet" },
          { label: "Bulan ini", value: stats.monthTotal, sub: bulanIni() },
          { label: `Siswa yang pernah ${unit}`, value: stats.students, sub: "Dari seluruh kelas" },
        ]}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 min-[900px]:grid-cols-2">
        <BarList title={`Siswa paling sering ${unit}`} data={stats.byName} empty="Belum ada data." />
        <MonthColumns title={`Jumlah ${unit} per bulan`} data={stats.byMonth} />
      </div>
      {stats.byCategory.length > 0 && <BarList title={stats.categoryLabel} data={stats.byCategory} empty="Belum ada data." />}
    </div>
  );
}
