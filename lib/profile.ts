// Profil siswa (hanya server): bio, Instagram, TikTok, LinkedIn, dan maksimal 3 foto unggahan seperti feed.
// Foto sudah dikecilkan & dijadikan WebP di browser (<= 200 KB) supaya penyimpanan tetap ringan.
import { randomUUID } from "node:crypto";
import { cmd, getJSON, setJSON } from "@/lib/store";

export const BIO_MAX = 150;
export const POST_MAX = 3;
export const POST_MAX_BYTES = 200_000;
export const IG_RE = /^[A-Za-z0-9._]{1,30}$/;
export const TT_RE = /^[A-Za-z0-9._]{2,24}$/;
export const LI_RE = /^[A-Za-z0-9_-]{3,100}$/;

export type Post = { id: string; at: string };
export type Profile = { bio: string; ig: string; showIg: boolean; tt: string; showTt: boolean; li: string; showLi: boolean; posts: Post[] };
export const EMPTY_PROFILE: Profile = { bio: "", ig: "", showIg: false, tt: "", showTt: false, li: "", showLi: false, posts: [] };
const EMPTY = EMPTY_PROFILE;

const pKey = (absen: number) => `k2:profile:${absen}`;
const postKey = (absen: number, id: string) => `k2:post:${absen}:${id}`;

export async function getProfile(absen: number): Promise<Profile> {
  return { ...EMPTY, ...(await getJSON<Partial<Profile>>(pKey(absen), {})) };
}

export async function saveInfo(absen: number, info: Pick<Profile, "bio" | "ig" | "showIg" | "tt" | "showTt" | "li" | "showLi">) {
  const p = await getProfile(absen);
  await setJSON(pKey(absen), { ...p, ...info });
}

export async function addPost(absen: number, type: string, b64: string): Promise<Post | string> {
  const p = await getProfile(absen);
  if (p.posts.length >= POST_MAX) return `Maksimal ${POST_MAX} foto. Hapus salah satu dulu.`;
  const post: Post = { id: randomUUID(), at: new Date().toISOString() };
  await cmd("SET", postKey(absen, post.id), `${type};${b64}`);
  await setJSON(pKey(absen), { ...p, posts: [post, ...p.posts] });
  return post;
}

export async function deletePost(absen: number, id: string): Promise<boolean> {
  const p = await getProfile(absen);
  if (!p.posts.some((x) => x.id === id)) return false;
  await cmd("DEL", postKey(absen, id));
  await setJSON(pKey(absen), { ...p, posts: p.posts.filter((x) => x.id !== id) });
  return true;
}

export async function getPostImage(absen: number, id: string): Promise<{ type: string; data: Buffer } | null> {
  const raw = await cmd<string | null>("GET", postKey(absen, id));
  if (!raw) return null;
  const [type, b64] = raw.split(";");
  return { type, data: Buffer.from(b64, "base64") };
}
