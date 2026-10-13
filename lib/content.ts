// Konten yang bisa diubah admin dari website (disimpan di Redis). Tipe & nilai awal; aman dipakai di browser.
import type { TaskItem } from "@/lib/tasks";
import type { ActivityType } from "@/lib/changelog";
import { DEFAULT_IZIN, type Divisi, type PermKey, type RoleKey } from "@/lib/roles";

export type OrgData = {
  dpp: string; // teks bebas, boleh kosong
  komti: string; // nama lengkap siswa
  wakomti: string;
  bendahara: string;
  sekretaris: string;
  koordinator: string; // Koordinator K2 (nama field lama dipertahankan)
  anggota: string[]; // Anggota K2
  kurikulum: Divisi;
  itl: Divisi; // IT & Logistik
  pubdok: Divisi; // Publikasi & Dokumentasi
  izin: Record<RoleKey, PermKey[]>; // hak akses tiap peran (diatur Admin Website)
};

// Pengurus kelas CAWU 1.
export const DEFAULT_ORG: OrgData = {
  dpp: "",
  komti: "Maria Godeliva Alexandra",
  wakomti: "Michael Aristo Bima Putra",
  bendahara: "Bernadeth Lidwina Hadibrata",
  sekretaris: "Davita Calista Putrijaya",
  koordinator: "Francis Demetrio Villanova",
  anggota: ["Celine Jessica", "Demetra Sandrea Suniadji", "Tania Audrey Susanto"],
  kurikulum: {
    koordinator: "Teguh Iman Samaeri Gea",
    anggota: ["Aloysius Bryan Kenietzko", "Bryan Valentino Poernomo", "Grady Wiendy Koesnadi", "Tegar Bagus Satria"],
  },
  itl: { koordinator: "Edward Devon Kosasih", anggota: ["Calvin Ramana Putra", "Rizky Ikhsan Fadillah"] },
  pubdok: {
    koordinator: "Caroline Fiona Agatha Kandiawan",
    anggota: ["Callista Anastasya", "Carnessa Billyza", "Yeremia Theofilus Handoyo"],
  },
  izin: DEFAULT_IZIN,
};

// Data struktur lama (sebelum ada divisi lain & izin) dilengkapi dengan nilai bawaan CAWU 1.
export function normOrg(o: Partial<OrgData> | null | undefined): OrgData {
  const d = DEFAULT_ORG;
  const div = (x: Partial<Divisi> | undefined, def: Divisi): Divisi => (x ? { koordinator: x.koordinator ?? "", anggota: Array.isArray(x.anggota) ? x.anggota : [] } : def);
  const izin = { ...d.izin };
  for (const r of Object.keys(izin) as RoleKey[]) if (Array.isArray(o?.izin?.[r])) izin[r] = o!.izin![r];
  return {
    dpp: o?.dpp ?? d.dpp,
    komti: o?.komti ?? d.komti,
    wakomti: o?.wakomti ?? d.wakomti,
    bendahara: o?.bendahara ?? d.bendahara,
    sekretaris: o?.sekretaris ?? d.sekretaris,
    koordinator: o?.koordinator ?? d.koordinator,
    anggota: Array.isArray(o?.anggota) ? o!.anggota : d.anggota,
    kurikulum: div(o?.kurikulum, d.kurikulum),
    itl: div(o?.itl, d.itl),
    pubdok: div(o?.pubdok, d.pubdok),
    izin,
  };
}

export type Slide = { id: string; src: string };
export type SlidesData = { duration: number; items: Slide[] }; // duration dalam detik

// Data lama panel "Foto Banner" (panelnya sudah dihapus; banner & jam kini memakai foto Galeri).
// Tetap disimpan supaya foto yang dulu diunggah lewat panel itu tidak ikut terhapus dari penyimpanan.
export const DEFAULT_SLIDES: SlidesData = { duration: 6, items: [] };

export type GalleryItem = { id: string; src: string; caption: string; at: string; by: string };

export type SeatsData = { order: number[]; prio: number[]; at?: string; by?: string } | null;

export type PelEdit = { kat?: string; ket?: string; poin?: number; hidden?: boolean };
export type PelAdded = { id: string; nama: string; kat: string; ket: string; tanggal: string; poin: number }; // tanggal YYYY-MM-DD
export type PelOverrides = { edits: Record<string, PelEdit>; added: PelAdded[]; hideFromShame: string[] };

export const DEFAULT_PEL: PelOverrides = { edits: {}, added: [], hideFromShame: [] };

export type Birthdays = Record<string, string>; // nama lengkap -> "MM-DD"

export type ScheduleItem = { id: string; day: number; start: string; end: string; matkul: string; ruang: string; dosen: string }; // day 1 = Senin

// Entri Log Aktivitas publik dari perubahan admin (lihat lib/changelog.ts).
export type ActivityLog = { type: ActivityType; title: string; detail: string; at: string; by: string };

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
