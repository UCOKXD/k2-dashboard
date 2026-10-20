"use client";
import { BarList, MonthColumns, StatGroup } from "@/components/IzinStats";
import { TINGKAT, type PelStatsData } from "@/lib/pel-stats";

const bulanIni = () => new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", month: "long", year: "numeric" });

// Ringkasan + dua grafik di halaman Pelanggaran (pola yang sama dengan halaman Izin).
export default function PelStats({ stats }: { stats: PelStatsData }) {
  return (
    <div className="space-y-5">
      <StatGroup
        items={[
          { label: "Total pelanggaran", value: stats.total, unit: "kasus", sub: "Semua data", bad: true },
          { label: "Bulan ini", value: stats.monthTotal, unit: "kasus", sub: bulanIni() },
          { label: "Siswa yang melanggar", value: stats.students, unit: "siswa", sub: "Dari seluruh kelas" },
        ]}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 min-[900px]:grid-cols-2">
        <MonthColumns title="Kasus per bulan" data={stats.byMonth} empty="Belum ada data." />
        <BarList
          title="Jenis pelanggaran terbanyak"
          data={stats.byCategory}
          empty="Belum ada data."
          footer={
            stats.total > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                {TINGKAT.map((t) => (
                  <span key={t.id} title={t.range} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.cls}`}>
                    {t.label} <span className="font-mono">{stats.tingkat[t.id]}</span>
                  </span>
                ))}
                <span className="font-mono text-xs text-ink-3">Tingkat dari poin: Ringan ≤20 · Sedang 21–50 · Berat &gt;50</span>
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
