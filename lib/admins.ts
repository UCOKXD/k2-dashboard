// Akun situs: setiap siswa punya satu akun. Sebagian juga admin (BPH = Badan Pengurus Harian, dan Divisi K2).
// Aman dipakai di browser (tanpa password). Username = panggilan + nomor absen (tidak membedakan huruf besar/kecil).
import { STUDENTS } from "@/lib/students";

export type Grup = "BPH" | "K2" | "Siswa";
export type Account = { username: string; nama: string; panggilan: string; absen: number; jabatan: string; grup: Grup };
export type Admin = Account & { grup: "BPH" | "K2" };

// Pengurus yang boleh membuka Panel Admin.
const ROLES: [full: string, jabatan: string, grup: Admin["grup"]][] = [
  ["Maria Godeliva Alexandra", "Komti", "BPH"],
  ["Michael Aristo Bima Putra", "Wakomti", "BPH"],
  ["Bernadeth Lidwina Hadibrata", "Bendahara", "BPH"],
  ["Davita Calista Putrijaya", "Sekretaris", "BPH"],
  ["Francis Demetrio Villanova", "Koordinator K2", "K2"],
  ["Celine Jessica", "Anggota K2", "K2"],
  ["Demetra Sandrea Suniadji", "Anggota K2", "K2"],
  ["Tania Audrey Susanto", "Anggota K2", "K2"],
];

export const ACCOUNTS: Account[] = STUDENTS.map((s) => {
  const role = ROLES.find(([full]) => full === s.full);
  return {
    username: `${s.short.replace(/\s+/g, "")}${s.absen}`,
    nama: s.full,
    panggilan: s.short,
    absen: s.absen,
    jabatan: role?.[1] ?? "Siswa",
    grup: role?.[2] ?? "Siswa",
  };
});

export const isAdminAccount = (a: Pick<Account, "grup">): a is Admin => a.grup !== "Siswa";
export const ADMINS = ACCOUNTS.filter(isAdminAccount);

export const findAccount = (username: string) => ACCOUNTS.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());
export const findAdmin = (username: string) => {
  const a = findAccount(username);
  return a && isAdminAccount(a) ? a : undefined;
};

export const GRUP_LABEL: Record<Grup, string> = { BPH: "Badan Pengurus Harian", K2: "Divisi K2", Siswa: "Siswa ABSORBING" };

// Info sesi yang dikirim ke browser. admin = boleh membuka Panel Admin.
export type SessionUser = Pick<Account, "username" | "nama" | "panggilan" | "absen" | "jabatan" | "grup"> & { admin: boolean; tempPassword: boolean };
