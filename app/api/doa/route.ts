import { NextResponse } from "next/server";
import { recordHistory, requireAdmin } from "@/lib/auth";
import { STUDENTS } from "@/lib/students";
import { type DoaPick, addDoaPick, getDoaPicks, monthId, pushJSON, resetDoaPicks, storeReady } from "@/lib/store";
import { todayJkt } from "@/lib/acara";
import { TITLES, sentence } from "@/lib/changelog";
import type { ActivityLog } from "@/lib/content";
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

// { name }: catat petugas doa hasil acak. { name, manual: true, date }: tandai sudah berdoa bulan ini
// di luar acak (mis. sebelum website dipakai). Hanya admin yang sudah masuk.
export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  const body = (await req.json().catch(() => ({}))) as { name?: unknown; manual?: unknown; date?: unknown };
  const s = STUDENTS.find((x) => x.full === body.name);
  if (!s) return NextResponse.json({ error: "Nama tidak dikenal" }, { status: 400 });
  const manual = body.manual === true;
  let at = new Date().toISOString();
  if (manual) {
    const today = todayJkt();
    const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : today;
    if (date.slice(0, 7) !== monthId() || date > today) return NextResponse.json({ error: "Tanggal harus di bulan ini dan tidak boleh lewat dari hari ini" }, { status: 400 });
    at = new Date(`${date}T08:00:00+07:00`).toISOString();
  }
  const pick: DoaPick = { name: s.full, nim: s.nim, at, by: user.panggilan, ...(manual ? { manual: true } : {}) };
  if (storeReady) {
    try {
      if ((await getDoaPicks()).some((p) => p.name === s.full)) return NextResponse.json({ error: `${s.full} sudah tercatat bulan ini` }, { status: 409 });
      await addDoaPick(pick);
      await recordHistory(user, manual ? `Menandai sudah berdoa bulan ini (di luar acak): ${s.full}` : `Mengacak petugas doa: ${s.full}`);
    } catch {
      return NextResponse.json({ error: "Gagal menyimpan" }, { status: 502 });
    }
    revalidatePath("/");
    revalidatePath("/api/logs");
  }
  return NextResponse.json({ ok: true, stored: storeReady, pick });
}

export async function DELETE(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  if (storeReady) {
    try {
      await resetDoaPicks();
      const detail = sentence(user, ["mereset riwayat petugas doa bulan ini (semua nama bisa terpilih lagi)"]);
      await recordHistory(user, detail);
      await pushJSON("k2:log", { type: "doa-reset", title: TITLES["doa-reset"], detail, at: new Date().toISOString(), by: user.panggilan } satisfies ActivityLog, 200);
    } catch {
      return NextResponse.json({ error: "Gagal mereset" }, { status: 502 });
    }
    revalidatePath("/");
    revalidatePath("/api/logs");
  }
  return NextResponse.json({ ok: true });
}
