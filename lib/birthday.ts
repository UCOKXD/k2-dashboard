// Siapa yang ulang tahun hari ini & bulan ini (zona Asia/Jakarta). Hanya untuk server.
import { daysUntil, todayJkt } from "@/lib/acara";
import { getContent } from "@/lib/content-server";
import { STUDENTS } from "@/lib/students";
import type { Birthdays } from "@/lib/content";

export type BdayPerson = { nama: string; short: string; absen: number | null; mmdd: string; days: number };
export type BdayInfo = { today: BdayPerson[]; month: BdayPerson[] };

export async function birthdayInfo(data?: Birthdays): Promise<BdayInfo> {
  const birthdays = data ?? (await getContent("birthdays"));
  const today = todayJkt();
  const [y, m] = today.split("-");
  const people = Object.entries(birthdays).map(([nama, mmdd]) => {
    const s = STUDENTS.find((x) => x.full === nama);
    return { nama, short: s?.short ?? nama, absen: s?.absen ?? null, mmdd, days: daysUntil(`${y}-${mmdd}`, today) };
  });
  const byDay = (a: BdayPerson, b: BdayPerson) => a.mmdd.localeCompare(b.mmdd) || (a.absen ?? 99) - (b.absen ?? 99);
  return {
    today: people.filter((p) => p.days === 0).sort(byDay),
    month: people.filter((p) => p.mmdd.startsWith(`${m}-`)).sort(byDay),
  };
}

// Ucapan ulang tahun yang dikirim teman sekelas (disimpan per tanggal).
export type Wish = { id: string; from: string; text: string; at: string };
export const wishKey = (day = todayJkt()) => `k2:wishes:${day}`;
export const WISH_MAX = 200; // karakter
export const WISH_PER_DEVICE = 3; // per hari
