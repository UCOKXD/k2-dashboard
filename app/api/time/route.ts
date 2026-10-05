import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Waktu server (Vercel, tersinkron NTP) untuk mengukur selisih jam perangkat pengunjung.
export function GET() {
  return NextResponse.json({ now: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
