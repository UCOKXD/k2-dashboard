import { NextResponse } from "next/server";
import { isBot, pull } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Bot di laptop mengambil pesan yang siap dikirim. Header: Authorization: Bearer <kunci bot>.
export async function GET(req: Request) {
  if (!(await isBot(req))) return NextResponse.json({ error: "Kunci bot salah" }, { status: 401 });
  try {
    return NextResponse.json(await pull(new URL(req.url).origin), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Antrian sedang bermasalah" }, { status: 502 });
  }
}
