import { NextResponse } from "next/server";
import { homeLogs } from "@/lib/home-logs";

// Disimpan sementara 20 detik di server, jadi notifikasi semua pengunjung tidak membebani Sheets/Redis.
export const revalidate = 20;

export async function GET() {
  try {
    const logs = await homeLogs();
    return NextResponse.json({ logs: logs.filter((l) => l.daysAgo <= 2).slice(0, 30) });
  } catch {
    return NextResponse.json({ logs: [] }, { status: 502 });
  }
}
