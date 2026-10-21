// Akun situs: setiap siswa punya satu akun. Aman dipakai di browser (tanpa password).
// Username = panggilan + nomor absen (tidak membedakan huruf besar/kecil).
//
// Peran & hak akses mengikuti Panel Admin → Struktur & Peran (diatur Admin Website):
// BPH (Komti, Wakomti, Bendahara, Sekretaris) dan divisi K2, Kurikulum, IT & Logistik, Publikasi & Dokumentasi.
// Tiap peran punya daftar izin sendiri (lib/roles.ts). Admin Website (pemilik web) selalu punya semua akses.
import { DEFAULT_ORG, type OrgData } from "@/lib/content";
import { ALL_PERMS, DIV_KEYS, ROLE_DEF, type DivKey, type PermKey, type RoleKey } from "@/lib/roles";
import { STUDENTS } from "@/lib/students";

export type Grup = "BPH" | "K2" | "Kurikulum" | "ITL" | "PubDok" | "Siswa";
export type Account = {
  username: string;
  key: string; // kunci penyimpanan password (tetap walau panggilan berubah)
  aliases: string[]; // username lama yang masih bisa dipakai masuk
  nama: string;
  panggilan: string;
  absen: number;
  jabatan: string;
  grup: Grup;
  roles: RoleKey[];
  perms: PermKey[];
  admin: boolean; // boleh membuka Panel Admin
  webAdmin: boolean;
};

export const WEB_ADMIN = "Francis Demetrio Villanova"; // pemilik & Admin Website (tetap, apa pun struktur kepengurusannya)

// Username lama (sebelum panggilan diganti): tetap bisa dipakai masuk, password-nya tidak hilang.
const LEGACY_USERNAME: Record<string, string> = {
  "Demetra Sandrea Suniadji": "Dea14",
  "Yeremia Theofilus Handoyo": "Yere34",
  "Kalissta Clarindajaya": "Kallista23",
};

const GRUP_OF: Record<RoleKey, Grup> = { bph: "BPH", k2: "K2", kurikulum: "Kurikulum", itl: "ITL", pubdok: "PubDok" };
const DIV_NAME: Record<DivKey, string> = { k2: "K2", kurikulum: "Kurikulum", itl: "IT & Logistik", pubdok: "PubDok" };

// Akun dasar (tanpa peran).
const BASE = STUDENTS.map((s) => {
  const username = `${s.short.replace(/\s+/g, "")}${s.absen}`;
  const legacy = LEGACY_USERNAME[s.full];
  return { username, key: (legacy ?? username).toLowerCase(), aliases: legacy ? [legacy] : [], nama: s.full, panggilan: s.short, absen: s.absen };
});
type Base = (typeof BASE)[number];

type Role = { role: RoleKey; jabatan: string };
const divOf = (org: OrgData, k: DivKey) => (k === "k2" ? { koordinator: org.koordinator, anggota: org.anggota } : org[k]);

// Semua peran tiap nama lengkap menurut struktur (satu orang boleh memegang lebih dari satu peran).
export function rolesFromOrg(org: OrgData): Map<string, Role[]> {
  const m = new Map<string, Role[]>();
  const put = (full: string, role: RoleKey, jabatan: string) => full && m.set(full, [...(m.get(full) ?? []), { role, jabatan }]);
  put(org.komti, "bph", "Komti");
  put(org.wakomti, "bph", "Wakomti");
  put(org.bendahara, "bph", "Bendahara");
  put(org.sekretaris, "bph", "Sekretaris");
  for (const k of DIV_KEYS) {
    const d = divOf(org, k);
    put(d.koordinator, k, `Koordinator ${DIV_NAME[k]}`);
    for (const a of d.anggota) put(a, k, `Anggota ${DIV_NAME[k]}`);
  }
  return m;
}

function withRole(b: Base, org: OrgData, roles: Map<string, Role[]>): Account {
  const mine = roles.get(b.nama) ?? [];
  const webAdmin = b.nama === WEB_ADMIN;
  const perms = webAdmin ? [...ALL_PERMS] : ALL_PERMS.filter((p) => mine.some((r) => org.izin[r.role]?.includes(p)));
  const first = mine[0];
  return {
    ...b,
    jabatan: first?.jabatan ?? (webAdmin ? "Admin Website" : "Siswa"),
    grup: first ? GRUP_OF[first.role] : "Siswa",
    roles: [...new Set(mine.map((r) => r.role))],
    perms,
    admin: webAdmin || perms.length > 0,
    webAdmin,
  };
}

export const accountsFor = (org: OrgData): Account[] => {
  const roles = rolesFromOrg(org);
  return BASE.map((b) => withRole(b, org, roles));
};

// Daftar akun dengan struktur bawaan (dipakai di browser untuk tampilan; server selalu memakai struktur terbaru).
export const ACCOUNTS: Account[] = accountsFor(DEFAULT_ORG);

export const isAdminAccount = (a: Pick<Account, "admin">) => a.admin;

export function findAccount(username: string, org: OrgData = DEFAULT_ORG): Account | undefined {
  const u = username.trim().toLowerCase();
  const b = BASE.find((a) => a.username.toLowerCase() === u || a.aliases.some((x) => x.toLowerCase() === u));
  return b && withRole(b, org, rolesFromOrg(org));
}

export const GRUP_LABEL: Record<Grup, string> = {
  BPH: "Badan Pengurus Harian",
  K2: "Kesiswaan & Kedisiplinan",
  Kurikulum: "Kurikulum",
  ITL: "IT & Logistik",
  PubDok: "Publikasi & Dokumentasi",
  Siswa: "Siswa ABSORBING",
};
export const roleLabel = (r: RoleKey) => ROLE_DEF[r].label;

// Info sesi yang dikirim ke browser. admin = boleh membuka Panel Admin; perms = fitur admin yang boleh dipakai.
// username = username awal (penanda internal akun, tidak berubah); login = username yang dipakai masuk sekarang.
export type SessionUser = Pick<Account, "username" | "nama" | "panggilan" | "absen" | "jabatan" | "grup" | "webAdmin" | "perms" | "admin"> & {
  tempPassword: boolean;
  login: string;
};

// Boleh memakai fitur ini? Admin Website selalu boleh.
export const can = (u: Pick<SessionUser, "webAdmin" | "perms"> | null | undefined, p: PermKey) => !!u && (u.webAdmin || u.perms.includes(p));
