import { NextResponse } from "next/server";
import { isNotifType } from "@/lib/notif";
import { ack, isBot } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Bot sudah mengirim satu pesan ke grup: hapus event-nya dari antrian.
export async function POST(req: Request) {
  if (!(await isBot(req))) return NextResponse.json({ error: "Kunci bot salah" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { ids?: unknown; type?: unknown; text?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === "string").slice(0, 100) : [];
  if (!ids.length || !isNotifType(body?.type)) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  try {
    await ack(ids, body.type, typeof body.text === "string" ? body.text : "");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal mengonfirmasi" }, { status: 502 });
  }
}
