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
  1: { label: "Mudah", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  2: { label: "Sedang", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  3: { label: "Sulit", cls: "border-rose-200 bg-rose-50 text-rose-700" },
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

export const URGENCY: Record<Urgency, { label: string; chip: string; dot: string }> = {
  urgent: { label: "URGENT", chip: "bg-red-600 text-white", dot: "bg-red-600" },
  medium: { label: "MEDIUM", chip: "bg-amber-500 text-white", dot: "bg-amber-500" },
  low: { label: "LOW", chip: "bg-emerald-600 text-white", dot: "bg-emerald-600" },
  lewat: { label: "LEWAT", chip: "bg-slate-400 text-white", dot: "bg-slate-400" },
  selesai: { label: "SELESAI", chip: "bg-slate-300 text-slate-700 line-through", dot: "bg-slate-300" },
};

export const daysLabel = (d: number) => (d < 0 ? `lewat ${-d} hari` : d === 0 ? "hari ini" : d === 1 ? "besok" : `${d} hari lagi`);
