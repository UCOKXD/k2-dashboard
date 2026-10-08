import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { recordHistory, requireAdmin } from "@/lib/auth";
import { WISH_MAX, WISH_PER_DEVICE, birthdayInfo, wishKey, type Wish } from "@/lib/birthday";
import { STUDENTS } from "@/lib/students";
import { NOT_READY, cmd, listJSON, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

const KEEP_DAYS = 40;

// Daftar ucapan hari ini (terbaru dulu).
export async function GET() {
  return NextResponse.json({ items: await listJSON<Wish>(wishKey(), 200) }, { headers: { "Cache-Control": "no-store" } });
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

// { from, text }: kirim ucapan. Terbuka untuk semua pengunjung, hanya pada hari ada yang ulang tahun.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Permintaan ditolak" }, { status: 403 });
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as { from?: unknown; text?: unknown };
  const s = STUDENTS.find((x) => x.full === body.from);
  if (!s) return NextResponse.json({ error: "Pilih namamu dulu" }, { status: 400 });
  // Hapus karakter kontrol & spasi berlebih.
  const text = String(body.text ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return NextResponse.json({ error: "Ucapannya masih kosong" }, { status: 400 });
  if (text.length > WISH_MAX) return NextResponse.json({ error: `Ucapan maksimal ${WISH_MAX} karakter` }, { status: 400 });

  try {
    const { today } = await birthdayInfo();
    if (!today.length) return NextResponse.json({ error: "Hari ini tidak ada yang ulang tahun" }, { status: 400 });

    const ip = (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown").slice(0, 64);
    const limitKey = `k2:wiship:${wishKey()}:${ip}`;
    const n = await cmd<number>("INCR", limitKey);
    if (n === 1) await cmd("EXPIRE", limitKey, 86_400);
    if (n > WISH_PER_DEVICE) return NextResponse.json({ error: `Maksimal ${WISH_PER_DEVICE} ucapan per hari dari satu perangkat` }, { status: 429 });

    const wish: Wish = { id: randomUUID(), from: s.full, text, at: new Date().toISOString() };
    await cmd("LPUSH", wishKey(), JSON.stringify(wish));
    await cmd("LTRIM", wishKey(), 0, 199);
    await cmd("EXPIRE", wishKey(), KEEP_DAYS * 86_400);
    return NextResponse.json({ ok: true, wish });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim ucapan, coba lagi" }, { status: 502 });
  }
}

// { id }: hapus ucapan yang tidak pantas. Hanya admin.
export async function DELETE(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  const { id } = (await req.json().catch(() => ({}))) as { id?: unknown };
  try {
    const raw = await cmd<string[]>("LRANGE", wishKey(), 0, -1);
    const hit = raw.find((r) => {
      try {
        return (JSON.parse(r) as Wish).id === id;
      } catch {
        return false;
      }
    });
    if (!hit) return NextResponse.json({ error: "Ucapan tidak ditemukan" }, { status: 404 });
    await cmd("LREM", wishKey(), 1, hit);
    const w = JSON.parse(hit) as Wish;
    await recordHistory(user, `Menghapus ucapan ulang tahun dari ${w.from}: "${w.text.slice(0, 60)}"`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 502 });
  }
}
