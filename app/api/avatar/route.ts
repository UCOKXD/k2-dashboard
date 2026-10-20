import { NextResponse } from "next/server";
import { recordHistory, requireAdmin, requireUser } from "@/lib/auth";
import { deleteAvatar, getAvatarMap, parseAvatar, setAvatar } from "@/lib/avatars";
import { NOT_READY, storeReady } from "@/lib/store";
import { STUDENTS } from "@/lib/students";

export const dynamic = "force-dynamic";

// Daftar siapa saja yang punya foto profil (nomor absen -> versi), untuk header, NGL, dan banner ulang tahun.
export async function GET() {
  const map = storeReady ? await getAvatarMap().catch(() => ({})) : {};
  return NextResponse.json({ avatars: map }, { headers: { "Cache-Control": "no-store" } });
}

// Pasang / ganti foto profil sendiri.
export async function POST(req: Request) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const { data } = (await req.json().catch(() => ({}))) as { data?: unknown };
  const p = parseAvatar(data);
  if ("error" in p) return NextResponse.json({ error: p.error }, { status: 400 });
  try {
    await setAvatar(user.absen, p.type, p.b64);
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan foto" }, { status: 502 });
  }
  await recordHistory(user, "Mengganti foto profil");
  return NextResponse.json({ ok: true });
}

// Hapus foto profil sendiri, atau (?absen=N) foto siswa lain oleh pengurus dengan izin "Akun".
export async function DELETE(req: Request) {
  const other = Number(new URL(req.url).searchParams.get("absen") || 0);
  const auth = other ? await requireAdmin(req, { perm: "akun" }) : await requireUser(req);
  if (auth.error) return auth.error;
  const absen = other || auth.user.absen;
  const s = STUDENTS.find((x) => x.absen === absen);
  if (!s) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  try {
    await deleteAvatar(absen);
  } catch {
    return NextResponse.json({ error: "Gagal menghapus foto" }, { status: 502 });
  }
  await recordHistory(auth.user, other ? `Menghapus foto profil ${s.short} (absen ${absen})` : "Menghapus foto profil");
  return NextResponse.json({ ok: true });
}
