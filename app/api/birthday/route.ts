import { NextResponse } from "next/server";
import { birthdayInfo } from "@/lib/birthday";

export const dynamic = "force-dynamic";

// Dipakai semua halaman untuk tema ulang tahun (hari ini dihitung di server, zona WIB).
export async function GET() {
  try {
    return NextResponse.json(await birthdayInfo(), {
      // Browser selalu bertanya ulang; hanya CDN Vercel yang menyimpan sebentar (60 detik).
      headers: { "Cache-Control": "no-cache", "Vercel-CDN-Cache-Control": "max-age=60" },
    });
  } catch {
    return NextResponse.json({ today: [], month: [] });
  }
}
