// Konten yang bisa diubah admin dari website (disimpan di Redis). Tipe & nilai awal; aman dipakai di browser.
import type { TaskItem } from "@/lib/tasks";

export type OrgData = {
  dpp: string; // teks bebas, boleh kosong
  komti: string; // nama lengkap siswa
  wakomti: string;
  bendahara: string;
  sekretaris: string;
  koordinator: string;
  anggota: string[];
};

export const DEFAULT_ORG: OrgData = {
  dpp: "",
  komti: "Maria Godeliva Alexandra",
  wakomti: "Michael Aristo Bima Putra",
  bendahara: "Bernadeth Lidwina Hadibrata",
  sekretaris: "Davita Calista Putrijaya",
  koordinator: "Francis Demetrio Villanova",
  anggota: ["Celine Jessica", "Demetra Sandrea Suniadji", "Tania Audrey Susanto"],
};

export type Slide = { id: string; src: string };
export type SlidesData = { duration: number; items: Slide[] }; // duration dalam detik

export const DEFAULT_SLIDES: SlidesData = {
  duration: 8,
  items: [
    { id: "bawaan-1", src: "/slides/foto-1.jpg" },
    { id: "bawaan-2", src: "/slides/foto-2.jpg" },
  ],
};

export type GalleryItem = { id: string; src: string; caption: string; at: string; by: string };

export type SeatsData = { order: number[]; prio: number[]; at?: string; by?: string } | null;

export type PelEdit = { kat?: string; ket?: string; poin?: number; hidden?: boolean };
export type PelAdded = { id: string; nama: string; kat: string; ket: string; tanggal: string; poin: number }; // tanggal YYYY-MM-DD
export type PelOverrides = { edits: Record<string, PelEdit>; added: PelAdded[]; hideFromShame: string[] };

export const DEFAULT_PEL: PelOverrides = { edits: {}, added: [], hideFromShame: [] };

export type Birthdays = Record<string, string>; // nama lengkap -> "MM-DD"

export type ScheduleItem = { id: string; day: number; start: string; end: string; matkul: string; ruang: string; dosen: string }; // day 1 = Senin

export type ActivityLog = { type: "seat"; title: string; detail: string; at: string; by: string };

export type HistoryItem = { at: string; by: string; jabatan: string; action: string };

export const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Kunci Redis untuk tiap dokumen yang bisa diedit lewat /api/content/[key].
export const CONTENT = {
  org: { key: "k2:org", fallback: DEFAULT_ORG as OrgData },
  slides: { key: "k2:slides", fallback: DEFAULT_SLIDES as SlidesData },
  gallery: { key: "k2:gallery", fallback: [] as GalleryItem[] },
  seats: { key: "k2:seats", fallback: null as SeatsData },
  pelanggaran: { key: "k2:pel", fallback: DEFAULT_PEL as PelOverrides },
  birthdays: { key: "k2:birthdays", fallback: {} as Birthdays },
  schedule: { key: "k2:schedule", fallback: [] as ScheduleItem[] },
  tasks: { key: "k2:tasks", fallback: [] as TaskItem[] },
} as const;

export type ContentKey = keyof typeof CONTENT;
export type ContentOf<K extends ContentKey> = (typeof CONTENT)[K]["fallback"];
