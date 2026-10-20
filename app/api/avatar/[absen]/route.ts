import { NextResponse } from "next/server";
import { getAvatar } from "@/lib/avatars";
import { storeReady } from "@/lib/store";

// Gambar foto profil. URL selalu memakai ?v=<versi>, jadi aman di-cache; versi berubah saat foto diganti.
export async function GET(_: Request, { params }: { params: Promise<{ absen: string }> }) {
  const { absen } = await params;
  const n = Number(absen);
  if (!storeReady || !Number.isInteger(n) || n < 1 || n > 99) return new NextResponse(null, { status: 404 });
  const img = await getAvatar(n).catch(() => null);
  if (!img) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(img.data), {
    headers: { "Content-Type": img.type, "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" },
  });
}
