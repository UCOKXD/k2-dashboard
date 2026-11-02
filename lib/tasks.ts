// Tugas kelas (Quiz, Presentasi, dll.) dengan deadline dan tingkat kesulitan. Aman dipakai di server maupun browser.
import { daysUntil } from "@/lib/acara";

export type TaskItem = {
  id: string;
  judul: string;
  matkul: string; // boleh kosong
  deadline: string; // YYYY-MM-DD
  jam: string; // HH:MM, boleh kosong
  difficulty: 1 | 2 | 3; // 1 Mudah, 2 Sedang, 3 Sulit
  catatan: string;
  done: boolean;
};

export const DIFFICULTY: Record<TaskItem["difficulty"], { label: string; cls: string }> = {
  1: { label: "Mudah", cls: "border-ok/30 bg-ok-soft text-ok" },
  2: { label: "Sedang", cls: "border-warn/40 bg-warn-soft text-warn" },
  3: { label: "Sulit", cls: "border-bad/30 bg-bad-soft text-bad" },
};

export type Urgency = "urgent" | "medium" | "low" | "lewat" | "selesai";

// Sisa hari <= 3: URGENT, 4-10: MEDIUM, > 10: LOW.
export function urgencyOf(t: TaskItem, today: string): { level: Urgency; days: number } {
  const days = daysUntil(t.deadline, today);
  if (t.done) return { level: "selesai", days };
  if (days < 0) return { level: "lewat", days };
  if (days <= 3) return { level: "urgent", days };
  if (days <= 10) return { level: "medium", days };
  return { level: "low", days };
}

// Warna chip desain v2 (lolos WCAG AA dengan teks putih); nilainya di --chip-* pada app/globals.css.
export const URGENCY: Record<Urgency, { label: string; chip: string; dot: string }> = {
  urgent: { label: "Mendesak", chip: "bg-[var(--chip-urgent)] text-white", dot: "bg-[var(--chip-urgent)]" },
  medium: { label: "Sedang", chip: "bg-[var(--chip-medium)] text-white", dot: "bg-[var(--chip-medium)]" },
  low: { label: "Santai", chip: "bg-[var(--chip-low)] text-white", dot: "bg-[var(--chip-low)]" },
  lewat: { label: "Lewat", chip: "bg-[var(--chip-lewat)] text-white", dot: "bg-[var(--chip-lewat)]" },
  selesai: { label: "Selesai", chip: "bg-line-strong text-ink-2 line-through", dot: "bg-line-strong" },
};

export const daysLabel = (d: number) => (d < 0 ? `lewat ${-d} hari` : d === 0 ? "hari ini" : d === 1 ? "besok" : `${d} hari lagi`);
