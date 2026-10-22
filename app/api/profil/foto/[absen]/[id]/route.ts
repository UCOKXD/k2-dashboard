import { NextResponse } from "next/server";
import { getPostImage } from "@/lib/profile";
import { storeReady } from "@/lib/store";

// Gambar foto profil (feed). Terbuka untuk semua (profil bisa dilihat tamu); id tidak pernah dipakai ulang jadi boleh di-cache di browser.
export async function GET(_: Request, { params }: { params: Promise<{ absen: string; id: string }> }) {
  const { absen, id } = await params;
  const n = Number(absen);
  if (!storeReady || !Number.isInteger(n) || !/^[0-9a-f-]{36}$/.test(id)) return new NextResponse(null, { status: 404 });
  const img = await getPostImage(n, id).catch(() => null);
  if (!img) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(img.data), {
    headers: { "Content-Type": img.type, "Cache-Control": "public, max-age=86400, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
