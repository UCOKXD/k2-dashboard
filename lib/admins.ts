// Akun situs: setiap siswa punya satu akun. Aman dipakai di browser (tanpa password).
// Username = panggilan + nomor absen (tidak membedakan huruf besar/kecil).
//
// Hak admin mengikuti tab Struktur di Panel Admin: Komti, Wakomti, Bendahara, Sekretaris = BPH;
// Koordinator K2 dan Anggota K2 = Divisi K2. Ganti struktur = hak admin ikut berganti.
// Admin Website (Francis) selalu admin dan satu-satunya yang boleh mengubah Struktur.
import { DEFAULT_ORG, type OrgData } from "@/lib/content";
import { STUDENTS } from "@/lib/students";

export type Grup = "BPH" | "K2" | "Siswa";
export type Account = { username: string; nama: string; panggilan: string; absen: number; jabatan: string; grup: Grup; webAdmin: boolean };
export type Admin = Account & { grup: "BPH" | "K2" };

export const WEB_ADMIN = "Francis Demetrio Villanova";

// Akun dasar (tanpa peran). Username tidak bergantung pada peran.
const BASE = STUDENTS.map((s) => ({ username: `${s.short.replace(/\s+/g, "")}${s.absen}`, nama: s.full, panggilan: s.short, absen: s.absen }));
type Base = (typeof BASE)[number];

// Peran tiap nama lengkap menurut Struktur (urutan menentukan kalau satu orang terisi di dua posisi).
export function rolesFromOrg(org: OrgData): Map<string, { jabatan: string; grup: Admin["grup"] }> {
  const m = new Map<string, { jabatan: string; grup: Admin["grup"] }>();
  const put = (full: string, jabatan: string, grup: Admin["grup"]) => full && !m.has(full) && m.set(full, { jabatan, grup });
  put(org.komti, "Komti", "BPH");
  put(org.wakomti, "Wakomti", "BPH");
  put(org.bendahara, "Bendahara", "BPH");
  put(org.sekretaris, "Sekretaris", "BPH");
  put(org.koordinator, "Koordinator K2", "K2");
  for (const a of org.anggota) put(a, "Anggota K2", "K2");
  return m;
}

function withRole(b: Base, roles: ReturnType<typeof rolesFromOrg>): Account {
  const r = roles.get(b.nama);
  const webAdmin = b.nama === WEB_ADMIN;
  // Admin Website tetap admin walau namanya tidak ada di Struktur, supaya tidak pernah terkunci.
  const role = r ?? (webAdmin ? { jabatan: "Admin Website", grup: "K2" as const } : { jabatan: "Siswa", grup: "Siswa" as const });
  return { ...b, ...role, webAdmin };
}

export const accountsFor = (org: OrgData): Account[] => {
  const roles = rolesFromOrg(org);
  return BASE.map((b) => withRole(b, roles));
};

// Daftar akun dengan struktur bawaan (dipakai di browser untuk tampilan; server selalu memakai struktur terbaru).
export const ACCOUNTS: Account[] = accountsFor(DEFAULT_ORG);

export const isAdminAccount = (a: Pick<Account, "grup">): a is Admin => a.grup !== "Siswa";

export function findAccount(username: string, org: OrgData = DEFAULT_ORG): Account | undefined {
  const b = BASE.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());
  return b && withRole(b, rolesFromOrg(org));
}

export const GRUP_LABEL: Record<Grup, string> = { BPH: "Badan Pengurus Harian", K2: "Divisi K2", Siswa: "Siswa ABSORBING" };

// Info sesi yang dikirim ke browser. admin = boleh membuka Panel Admin; webAdmin = Admin Website.
export type SessionUser = Pick<Account, "username" | "nama" | "panggilan" | "absen" | "jabatan" | "grup" | "webAdmin"> & {
  admin: boolean;
  tempPassword: boolean;
};
