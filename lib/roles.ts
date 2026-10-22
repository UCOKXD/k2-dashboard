// Peran pengurus kelas dan hak akses (izin) tiap peran. Aman dipakai di browser.
// Siapa memegang peran apa diatur Admin Website di Panel Admin → Struktur & Peran; izin tiap peran juga diatur di sana.

// Divisi (selain BPH yang punya 4 jabatan tetap). "k2" memakai field lama koordinator/anggota di OrgData.
export type DivKey = "k2" | "kurikulum" | "itl" | "pubdok";
export type RoleKey = "bph" | DivKey;
export type Divisi = { koordinator: string; anggota: string[] };

export const ROLE_DEFS: { key: RoleKey; label: string; short: string }[] = [
  { key: "bph", label: "Badan Pengurus Harian", short: "BPH" },
  { key: "k2", label: "Kesiswaan & Kedisiplinan", short: "K2" },
  { key: "kurikulum", label: "Kurikulum", short: "Kurikulum" },
  { key: "itl", label: "IT & Logistik", short: "IT & Logistik" },
  { key: "pubdok", label: "Publikasi & Dokumentasi", short: "PubDok" },
];
export const ROLE_DEF = Object.fromEntries(ROLE_DEFS.map((r) => [r.key, r])) as Record<RoleKey, (typeof ROLE_DEFS)[number]>;
export const DIV_KEYS: DivKey[] = ["k2", "kurikulum", "itl", "pubdok"];

// Hak akses yang bisa diberikan ke peran. Struktur & Peran serta Notifikasi WA (bot) selalu khusus Admin Website.
export type PermKey = "pelanggaran" | "galeri" | "ultah" | "jadwal" | "tugas" | "doa" | "tempat_duduk" | "riwayat" | "akun" | "ngl" | "inventaris";
export const PERMS: { key: PermKey; label: string; desc: string }[] = [
  { key: "pelanggaran", label: "Pelanggaran", desc: "Tambah, koreksi, dan sembunyikan data pelanggaran" },
  { key: "galeri", label: "Galeri", desc: "Unggah dan hapus foto galeri (juga foto banner & latar jam)" },
  { key: "ultah", label: "Ulang Tahun", desc: "Data tanggal lahir dan hapus ucapan ulang tahun" },
  { key: "jadwal", label: "Jadwal", desc: "Jadwal kuliah" },
  { key: "tugas", label: "Tugas", desc: "Daftar tugas dan tenggat" },
  { key: "doa", label: "Acak Doa", desc: "Mengacak petugas doa harian" },
  { key: "tempat_duduk", label: "Tempat Duduk", desc: "Mengacak dan menyimpan denah tempat duduk" },
  { key: "riwayat", label: "Riwayat", desc: "Melihat riwayat perubahan admin" },
  { key: "akun", label: "Akun", desc: "Melihat status semua akun dan mereset password" },
  { key: "ngl", label: "NGL", desc: "Membuka/menutup sesi NGL, melihat progres, laporan, serta isi & pengirim pesan" },
  { key: "inventaris", label: "Inventaris", desc: "Melihat dan mencatat barang inventaris kelas serta peminjamannya" },
];
export const ALL_PERMS: PermKey[] = PERMS.map((p) => p.key);
export const isPermKey = (k: unknown): k is PermKey => typeof k === "string" && (ALL_PERMS as string[]).includes(k);

// Izin yang sudah ada sebelum izin "ngl" ditambahkan. Data izin lama yang belum mengenal izin baru
// otomatis mendapat nilai bawaan untuk izin baru itu (lihat normOrg di lib/content.ts).
export const PERMS_V1: PermKey[] = ["pelanggaran", "galeri", "ultah", "jadwal", "tugas", "doa", "tempat_duduk", "riwayat", "akun"];

// Izin bawaan (CAWU 1): BPH & K2 penuh (kecuali bot & inventaris), Kurikulum tugas & jadwal, PubDok galeri,
// IT & Logistik inventaris. Inventaris sengaja tidak otomatis untuk BPH/K2; Admin Website bisa mencentangnya di Struktur & Peran.
const INTI = ALL_PERMS.filter((p) => p !== "inventaris");
export const DEFAULT_IZIN: Record<RoleKey, PermKey[]> = {
  bph: [...INTI],
  k2: [...INTI],
  kurikulum: ["jadwal", "tugas"],
  itl: ["inventaris"],
  pubdok: ["galeri"],
};
