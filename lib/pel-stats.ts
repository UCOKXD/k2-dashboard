// Statistik halaman Pelanggaran: ringkasan, tren 6 bulan, jenis terbanyak, dan tingkat (dari poin).
import type { Count } from "@/lib/izin-stats";
import type { PelRow } from "@/lib/dashboard";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Tingkat pelanggaran ditentukan dari poinnya (aturan Divisi K2):
// sampai 20 poin = Ringan, 21–50 = Sedang, di atas 50 = Berat.
export const TINGKAT = [
  { id: "ringan", label: "Ringan", range: "≤20 poin", cls: "bg-slate-100 text-slate-700" },
  { id: "sedang", label: "Sedang", range: "21–50 poin", cls: "bg-amber-50 text-amber-700" },
  { id: "berat", label: "Berat", range: ">50 poin", cls: "bg-rose-50 text-rose-700" },
] as const;
export type TingkatId = (typeof TINGKAT)[number]["id"];
export const tingkatOf = (poin: number): TingkatId => (poin > 50 ? "berat" : poin > 20 ? "sedang" : "ringan");

export type PelStatsData = {
  total: number;
  monthTotal: number;
  students: number;
  byMonth: Count[]; // 6 bulan terakhir, bulan berjalan paling akhir
  byCategory: Count[]; // 4 jenis teratas + "Lainnya"
  tingkat: Record<TingkatId, number>;
};

export function pelStats(rows: PelRow[]): PelStatsData {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const months = new Map<string, number>();
  const cats = new Map<string, { label: string; n: number }>();
  const tingkat: Record<TingkatId, number> = { ringan: 0, sedang: 0, berat: 0 };
  let monthTotal = 0;

  for (const r of rows) {
    const [, m, y] = r.tanggal.split(/\D+/).map(Number);
    if (m && y) {
      const k = `${y}-${String(m).padStart(2, "0")}`;
      months.set(k, (months.get(k) ?? 0) + 1);
      if (m === now.getMonth() + 1 && y === now.getFullYear()) monthTotal++;
    }
    const k = r.kat.toLowerCase().replace(/\s+/g, " ");
    const c = cats.get(k) ?? { label: r.kat, n: 0 };
    c.n++;
    cats.set(k, c);
    tingkat[tingkatOf(r.poin)]++;
  }

  const byMonth: Count[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { label: BULAN[d.getMonth()], sub: String(d.getFullYear()), n: months.get(k) ?? 0 };
  });

  const sorted = [...cats.values()].filter((c) => c.label !== "Lainnya").sort((a, b) => b.n - a.n);
  const byCategory: Count[] = sorted.slice(0, 4).map((c) => ({ label: c.label, n: c.n }));
  const rest = sorted.slice(4).reduce((n, c) => n + c.n, 0) + (cats.get("lainnya")?.n ?? 0);
  if (rest) byCategory.push({ label: "Lainnya", n: rest });

  return { total: rows.length, monthTotal, students: new Set(rows.map((r) => r.nama)).size, byMonth, byCategory, tingkat };
}
