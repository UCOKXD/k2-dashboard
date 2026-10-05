import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { STUDENTS } from "@/lib/students";
import { addDoaPick, getDoaPicks, resetDoaPicks, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

// PIN admin disimpan di Environment Variables Vercel dengan nama ADMIN_PIN.
function pinOk(pin: unknown) {
  const real = process.env.ADMIN_PIN;
  if (!real || typeof pin !== "string") return false;
  const a = Buffer.from(pin);
  const b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

function denied() {
  return NextResponse.json(
    { error: process.env.ADMIN_PIN ? "PIN salah" : "PIN admin belum diatur di Vercel (ADMIN_PIN)" },
    { status: 401 }
  );
}

// Riwayat acak bulan ini (kosong kalau penyimpanan belum dipasang; browser memakai riwayat lokal).
export async function GET() {
  if (!storeReady) return NextResponse.json({ stored: false, picks: [] });
  try {
    return NextResponse.json({ stored: true, picks: await getDoaPicks() });
  } catch {
    return NextResponse.json({ error: "Gagal membaca riwayat" }, { status: 502 });
  }
}

// { pin, name? }: tanpa name = hanya cek PIN; dengan name = catat petugas doa.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { pin?: unknown; name?: unknown };
  if (!pinOk(body.pin)) return denied();
  if (body.name === undefined) return NextResponse.json({ ok: true, stored: storeReady });

  const s = STUDENTS.find((x) => x.full === body.name);
  if (!s) return NextResponse.json({ error: "Nama tidak dikenal" }, { status: 400 });
  const pick = { name: s.full, nim: s.nim, at: new Date().toISOString() };
  if (storeReady) {
    try {
      await addDoaPick(pick);
    } catch {
      return NextResponse.json({ error: "Gagal menyimpan" }, { status: 502 });
    }
  }
  return NextResponse.json({ ok: true, stored: storeReady, pick });
}

export async function DELETE(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { pin?: unknown };
  if (!pinOk(body.pin)) return denied();
  if (storeReady) {
    try {
      await resetDoaPicks();
    } catch {
      return NextResponse.json({ error: "Gagal mereset" }, { status: 502 });
    }
  }
  return NextResponse.json({ ok: true });
}
