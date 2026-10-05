import { NextResponse } from "next/server";
import { recordHistory, requireAdmin } from "@/lib/auth";
import { STUDENTS } from "@/lib/students";
import { addDoaPick, getDoaPicks, resetDoaPicks, storeReady } from "@/lib/store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// Riwayat acak bulan ini (kosong kalau penyimpanan belum dipasang; browser memakai riwayat lokal).
export async function GET() {
  if (!storeReady) return NextResponse.json({ stored: false, picks: [] });
  try {
    return NextResponse.json({ stored: true, picks: await getDoaPicks() });
  } catch {
    return NextResponse.json({ error: "Gagal membaca riwayat" }, { status: 502 });
  }
}

// { name }: catat petugas doa hasil acak. Hanya admin yang sudah masuk.
export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  const body = (await req.json().catch(() => ({}))) as { name?: unknown };
  const s = STUDENTS.find((x) => x.full === body.name);
  if (!s) return NextResponse.json({ error: "Nama tidak dikenal" }, { status: 400 });
  const pick = { name: s.full, nim: s.nim, at: new Date().toISOString(), by: user.panggilan };
  if (storeReady) {
    try {
      await addDoaPick(pick);
      await recordHistory(user, `Mengacak petugas doa: ${s.full}`);
    } catch {
      return NextResponse.json({ error: "Gagal menyimpan" }, { status: 502 });
    }
    revalidatePath("/");
  }
  return NextResponse.json({ ok: true, stored: storeReady, pick });
}

export async function DELETE(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  if (storeReady) {
    try {
      await resetDoaPicks();
      await recordHistory(user, "Mereset riwayat doa bulan ini");
    } catch {
      return NextResponse.json({ error: "Gagal mereset" }, { status: 502 });
    }
    revalidatePath("/");
  }
  return NextResponse.json({ ok: true });
}
