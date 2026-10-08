"use client";
import { BarList, MonthColumns, Tile } from "@/components/IzinStats";
import { TINGKAT, type PelStatsData } from "@/lib/pel-stats";

// Ringkasan + dua grafik di halaman Pelanggaran (pola yang sama dengan halaman Izin).
export default function PelStats({ stats }: { stats: PelStatsData }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile label="Total pelanggaran" value={stats.total} />
        <Tile label="Pelanggaran bulan ini" value={stats.monthTotal} />
        <Tile label="Siswa yang melanggar" value={stats.students} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <MonthColumns title="Kasus per bulan (6 bulan terakhir)" data={stats.byMonth} accent="bg-sea-600" currentAccent="k2-bar-now bg-navy-900" empty="Belum ada data." />
        <BarList
          title="Jenis pelanggaran terbanyak"
          data={stats.byCategory}
          accent="bg-sea-600"
          restAccent="bg-slate-400"
          empty="Belum ada data."
          footer={
            stats.total > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                {TINGKAT.map((t) => (
                  <span key={t.id} title={t.range} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.cls}`}>
                    {t.label} {stats.tingkat[t.id]}
                  </span>
                ))}
                <span className="text-xs text-slate-400">Tingkat dari poin: Ringan ≤20 · Sedang 21–50 · Berat &gt;50</span>
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
