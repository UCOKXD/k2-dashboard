// Username pilihan siswa (hanya server). Disimpan per Account.key: { [key]: "usernameBaru" }.
// Selama username pilihan aktif, username awal (panggilan+absen) tidak bisa dipakai masuk.
// Reset password oleh admin juga mengembalikan username ke username awal.
import { ACCOUNTS, type Account } from "@/lib/admins";
import { getJSON, setJSON } from "@/lib/store";

const KEY = "k2:usernames";
export const USERNAME_RE = /^[A-Za-z0-9._]{3,20}$/;
export type UsernameMap = Record<string, string>;

export const getUsernames = () => getJSON<UsernameMap>(KEY, {});

// Username yang dipakai sekarang untuk akun ini.
export const loginOf = (a: Pick<Account, "key" | "username">, map: UsernameMap) => map[a.key] ?? a.username;

// Cek username baru: format & belum dipakai akun lain (termasuk username awal & username lama akun lain).
export function usernameError(name: string, key: string, map: UsernameMap): string | null {
  if (!USERNAME_RE.test(name)) return "Username 3–20 karakter: huruf, angka, titik, atau garis bawah (tanpa spasi).";
  const u = name.toLowerCase();
  for (const a of ACCOUNTS) {
    if (a.key === key) continue;
    if (a.username.toLowerCase() === u || a.aliases.some((x) => x.toLowerCase() === u) || map[a.key]?.toLowerCase() === u) return "Username itu sudah dipakai.";
  }
  return null;
}

export async function setUsername(key: string, name: string | null) {
  const map = await getUsernames();
  if (name) map[key] = name;
  else delete map[key];
  await setJSON(KEY, map);
}
