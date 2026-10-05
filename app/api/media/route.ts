import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { NOT_READY, cmd, storeReady } from "@/lib/store";

const MAX_BYTES = 1_500_000; // foto sudah dikompres di browser sebelum dikirim

// Unggah foto (JPEG/PNG/WebP base64). Foto baru "dipakai" setelah dimasukkan ke banner atau galeri.
export async function POST(req: Request) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const { data } = (await req.json().catch(() => ({}))) as { data?: string };
  const m = typeof data === "string" ? /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(data) : null;
  if (!m) return NextResponse.json({ error: "Format foto tidak didukung" }, { status: 400 });
  if (m[2].length * 0.75 > MAX_BYTES) return NextResponse.json({ error: "Foto terlalu besar" }, { status: 413 });
  const id = randomUUID();
  try {
    await cmd("SET", `k2:media:${id}`, `${m[1]};${m[2]}`);
    await cmd("SADD", "k2:media:all", id);
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan foto" }, { status: 502 });
  }
  return NextResponse.json({ src: `/api/media/${id}` });
}
