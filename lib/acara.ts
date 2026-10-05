// Acara dari tab "Acara Mendatang" di sheet -> daftar acara bertanggal. Aman dipakai di server maupun browser.
import type { Table } from "@/lib/sheets";

export type CalEvent = { date: string; title: string; detail: string }; // date = "YYYY-MM-DD"

// Tanggal di sheet bisa "DD/MM/YYYY" (format Indonesia) atau "YYYY-MM-DD". Hasil: "YYYY-MM-DD".
export function isoDate(s = ""): string | null {
  const n = s.split(/\D+/).filter(Boolean).map(Number);
  if (n.length < 3) return null;
  const [d, m, y] = n[0] > 31 ? [n[2], n[1], n[0]] : [n[0], n[1], n[2] < 100 ? 2000 + n[2] : n[2]];
  if (!d || !m || !y || m > 12 || d > 31) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Kolom tanggal acara dan nama acara dideteksi dari judul kolom di sheet.
export function eventsFrom(t: Table): CalEvent[] {
  const cols = t.cols.filter((c) => c.key !== "A");
  const dateCol = cols.find((c) => /tanggal|tgl|hari/i.test(c.label))?.key ?? t.date;
  const titleCol = cols.find((c) => c.key !== dateCol && /nama acara|acara|kegiatan|judul|event/i.test(c.label))?.key ?? t.name;
  const others = cols.filter((c) => c.key !== dateCol && c.key !== titleCol);
  return t.rows.flatMap((r) => {
    const date = isoDate(r[dateCol]);
    const title = (r[titleCol] ?? "").trim();
    if (!date || !title) return [];
    const detail = others.map((c) => (r[c.key] ?? "").trim()).filter(Boolean).slice(0, 3).join(" · ");
    return [{ date, title, detail }];
  });
}

// Hari ini di zona Jakarta, "YYYY-MM-DD".
export const todayJkt = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

export function daysUntil(ymd: string, today = todayJkt()) {
  const [a, b] = [ymd, today].map((s) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((a - b) / 86_400_000);
}
