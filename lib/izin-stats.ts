// Statistik untuk halaman Izin Sakit & Izin: siapa paling sering, tren per bulan, dan jenis/keluhan terbanyak.
import type { Table } from "@/lib/sheets";
import { STUDENTS, resolveName } from "@/lib/students";

export type Count = { label: string; sub?: string; n: number };
export type IzinStatsData = {
  total: number;
  monthTotal: number; // bulan berjalan
  students: number; // jumlah siswa berbeda
  byName: Count[]; // terbanyak dulu
  byMonth: Count[]; // 6 bulan terakhir, urut waktu
  byCategory: Count[]; // jenis izin / keluhan
  categoryLabel: string;
};

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function izinStats(t: Table, categoryRe: RegExp, categoryLabel: string): IzinStatsData {
  const others = t.cols.filter((c) => c.key !== "A" && c.key !== t.name && c.key !== t.date);
  const catCol = others.find((c) => categoryRe.test(c.label))?.key;
  const dmy = (r: Record<string, string>) => (r[t.date] || r.A || "").split(/\D+/).map(Number);

  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const names = new Map<string, number>();
  const months = new Map<string, number>();
  const cats = new Map<string, { label: string; n: number }>();
  let monthTotal = 0;

  for (const r of t.rows) {
    const nama = resolveName(r[t.name] ?? "");
    if (nama) names.set(nama, (names.get(nama) ?? 0) + 1);
    const [, m, y] = dmy(r);
    if (m && y) {
      const k = `${y}-${String(m).padStart(2, "0")}`;
      months.set(k, (months.get(k) ?? 0) + 1);
      if (m === now.getMonth() + 1 && y === now.getFullYear()) monthTotal++;
    }
    const raw = catCol ? (r[catCol] ?? "").trim() : "";
    if (raw) {
      const k = raw.toLowerCase().replace(/\s+/g, " ");
      const c = cats.get(k) ?? { label: raw, n: 0 };
      c.n++;
      cats.set(k, c);
    }
  }

  const byMonth: Count[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { label: BULAN[d.getMonth()], sub: String(d.getFullYear()), n: months.get(k) ?? 0 };
  });

  const sortedCats = [...cats.values()].sort((a, b) => b.n - a.n);
  const byCategory: Count[] = sortedCats.slice(0, 6).map((c) => ({ label: c.label, n: c.n }));
  const rest = sortedCats.slice(6).reduce((n, c) => n + c.n, 0);
  if (rest) byCategory.push({ label: "Lainnya", n: rest });

  return {
    total: t.rows.length,
    monthTotal,
    students: names.size,
    byName: [...names]
      .map(([nama, n]) => ({ label: STUDENTS.find((s) => s.full === nama)?.short ?? nama, sub: nama, n }))
      .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label))
      .slice(0, 10),
    byMonth,
    byCategory,
    categoryLabel,
  };
}
