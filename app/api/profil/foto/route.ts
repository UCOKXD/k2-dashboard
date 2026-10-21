import { NextResponse } from "next/server";
import { recordHistory, requireAdmin, requireUser } from "@/lib/auth";
import { parseAvatar } from "@/lib/avatars";
import { POST_MAX_BYTES, addPost, deletePost } from "@/lib/profile";
import { NOT_READY, storeReady } from "@/lib/store";
import { STUDENTS } from "@/lib/students";

// Unggah foto ke halaman profil sendiri (maks. 3, WebP/JPEG <= 200 KB setelah dikompres di browser).
export async function POST(req: Request) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const { data } = (await req.json().catch(() => ({}))) as { data?: unknown };
  const p = parseAvatar(data, POST_MAX_BYTES);
  if ("error" in p) return NextResponse.json({ error: p.error }, { status: 400 });
  const r = await addPost(user.absen, p.type, p.b64);
  if (typeof r === "string") return NextResponse.json({ error: r }, { status: 400 });
  await recordHistory(user, "Mengunggah foto ke profil");
  return NextResponse.json({ ok: true, post: r });
}

// Hapus foto profil sendiri, atau (?absen=N) milik siswa lain oleh pengurus dengan izin "Akun".
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const other = Number(url.searchParams.get("absen") || 0);
  const auth = other ? await requireAdmin(req, { perm: "akun" }) : await requireUser(req);
  if (auth.error) return auth.error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const absen = other || auth.user.absen;
  const s = STUDENTS.find((x) => x.absen === absen);
  if (!s || !(await deletePost(absen, id))) return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
  await recordHistory(auth.user, other && other !== auth.user.absen ? `Menghapus foto di profil ${s.short} (absen ${absen})` : "Menghapus foto dari profil");
  return NextResponse.json({ ok: true });
}
