import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { recordHistory, requireAdmin } from "@/lib/auth";
import { WISH_MAX, WISH_PER_IP, birthdayInfo, wishKey, type Wish } from "@/lib/birthday";
import { NOT_READY, cmd, listJSON, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

const KEEP_DAYS = 40;
const DEVICE = "k2_dev"; // penanda perangkat (acak, tanpa data pribadi)

function deviceOf(req: Request) {
  const m = /(?:^|;\s*)k2_dev=([A-Za-z0-9-]{20,64})/.exec(req.headers.get("cookie") ?? "");
  return m?.[1] ?? null;
}
const sentKey = (dev: string) => `k2:wishdev:${wishKey()}:${dev}`;
const strip = (w: Wish & { from?: string }): Wish => ({ id: w.id, text: w.text, at: w.at }); // ucapan lama yang masih bernama ikut dianonimkan

// Daftar ucapan hari ini (terbaru dulu) + apakah perangkat ini sudah mengirim.
export async function GET(req: Request) {
  const items = (await listJSON<Wish>(wishKey(), 200)).map(strip);
  let mine = false;
  const dev = deviceOf(req);
  if (dev && storeReady) {
    try {
      mine = Boolean(await cmd<string | null>("GET", sentKey(dev)));
    } catch {}
  }
  return NextResponse.json({ items, mine }, { headers: { "Cache-Control": "no-store" } });
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

// { text }: kirim ucapan anonim. 1 ucapan per perangkat per hari, hanya pada hari ada yang ulang tahun.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Permintaan ditolak" }, { status: 403 });
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as { text?: unknown };
  const text = String(body.text ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return NextResponse.json({ error: "Ucapannya masih kosong" }, { status: 400 });
  if (text.length > WISH_MAX) return NextResponse.json({ error: `Ucapan maksimal ${WISH_MAX} karakter` }, { status: 400 });

  try {
    const { today } = await birthdayInfo();
    if (!today.length) return NextResponse.json({ error: "Hari ini tidak ada yang ulang tahun" }, { status: 400 });

    const dev = deviceOf(req) ?? randomUUID();
    // Satu perangkat satu ucapan: tandai dulu (SET NX), baru simpan ucapannya.
    const first = await cmd<string | null>("SET", sentKey(dev), "1", "NX", "EX", 86_400);
    if (first !== "OK") return NextResponse.json({ error: "Perangkat ini sudah mengirim ucapan hari ini" }, { status: 429 });

    const ip = (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown").slice(0, 64);
    const ipKey = `k2:wiship:${wishKey()}:${ip}`;
    const n = await cmd<number>("INCR", ipKey);
    if (n === 1) await cmd("EXPIRE", ipKey, 86_400);
    if (n > WISH_PER_IP) return NextResponse.json({ error: "Terlalu banyak ucapan dari jaringan ini hari ini" }, { status: 429 });

    const wish: Wish = { id: randomUUID(), text, at: new Date().toISOString() };
    await cmd("LPUSH", wishKey(), JSON.stringify(wish));
    await cmd("LTRIM", wishKey(), 0, 199);
    await cmd("EXPIRE", wishKey(), KEEP_DAYS * 86_400);
    const res = NextResponse.json({ ok: true, wish });
    res.cookies.set(DEVICE, dev, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 365 * 86_400 });
    return res;
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
    await recordHistory(user, `Menghapus ucapan ulang tahun anonim: "${w.text.slice(0, 60)}"`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 502 });
  }
}
