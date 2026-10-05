// Akun admin: BPH (Badan Pengurus Harian) dan Divisi K2. Aman dipakai di browser (tanpa password).
// Username = panggilan + nomor absen (tidak membedakan huruf besar/kecil saat login).
import { STUDENTS } from "@/lib/students";

export type Admin = { username: string; nama: string; panggilan: string; absen: number; jabatan: string; grup: "BPH" | "K2" };

const LIST: [full: string, panggilan: string, jabatan: string, grup: Admin["grup"]][] = [
  ["Maria Godeliva Alexandra", "Maria", "Komti", "BPH"],
  ["Michael Aristo Bima Putra", "Michael", "Wakomti", "BPH"],
  ["Bernadeth Lidwina Hadibrata", "Ina", "Bendahara", "BPH"],
  ["Davita Calista Putrijaya", "Davita", "Sekretaris", "BPH"],
  ["Francis Demetrio Villanova", "Ancis", "Koordinator K2", "K2"],
  ["Celine Jessica", "Celine", "Anggota K2", "K2"],
  ["Demetra Sandrea Suniadji", "Dea", "Anggota K2", "K2"],
  ["Tania Audrey Susanto", "Tania", "Anggota K2", "K2"],
];

export const ADMINS: Admin[] = LIST.map(([nama, panggilan, jabatan, grup]) => {
  const absen = STUDENTS.find((s) => s.full === nama)?.absen ?? 0;
  return { username: `${panggilan}${absen}`, nama, panggilan, absen, jabatan, grup };
});

export const findAdmin = (username: string) => ADMINS.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());

// Info sesi yang dikirim ke browser.
export type SessionUser = Pick<Admin, "username" | "nama" | "panggilan" | "jabatan" | "grup"> & { tempPassword: boolean };
