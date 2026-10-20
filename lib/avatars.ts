// Foto profil siswa (hanya dipakai di server). Satu foto per nomor absen, disimpan kecil (sudah dikompres di browser).
import { cmd, getJSON, setJSON } from "@/lib/store";

const MAP = "k2:avatars"; // { [absen]: versi (ms) } — dipakai sebagai penanda cache gambar
const key = (absen: number) => `k2:avatar:${absen}`;
export const AVATAR_MAX_BYTES = 200_000;

export type AvatarMap = Record<string, number>;

export const getAvatarMap = () => getJSON<AvatarMap>(MAP, {});

export async function getAvatar(absen: number): Promise<{ type: string; data: Buffer } | null> {
  const raw = await cmd<string | null>("GET", key(absen));
  if (!raw) return null;
  const [type, b64] = raw.split(";");
  return { type, data: Buffer.from(b64, "base64") };
}

// Cek tanda tangan berkas supaya yang disimpan benar-benar gambar JPEG/PNG/WebP.
function isImage(type: string, buf: Buffer) {
  if (type === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  if (type === "image/png") return buf.subarray(1, 4).toString() === "PNG";
  if (type === "image/webp") return buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";
  return false;
}

export function parseAvatar(data: unknown): { type: string; b64: string } | { error: string } {
  const m = typeof data === "string" ? /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(data) : null;
  if (!m) return { error: "Format foto tidak didukung (pakai JPG, PNG, atau WebP)" };
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > AVATAR_MAX_BYTES) return { error: "Foto terlalu besar" };
  if (!isImage(m[1], buf)) return { error: "Berkas bukan gambar yang valid" };
  return { type: m[1], b64: m[2] };
}

export async function setAvatar(absen: number, type: string, b64: string) {
  await cmd("SET", key(absen), `${type};${b64}`);
  const map = await getAvatarMap();
  await setJSON(MAP, { ...map, [absen]: Date.now() });
}

export async function deleteAvatar(absen: number) {
  await cmd("DEL", key(absen));
  const map = await getAvatarMap();
  delete map[absen];
  await setJSON(MAP, map);
}
