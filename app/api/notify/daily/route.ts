import { NextResponse } from "next/server";
import { todayJkt } from "@/lib/acara";
import { birthdayInfo } from "@/lib/birthday";
import { notify, todayAtWib } from "@/lib/notify";
import { storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

// Jendela kirim ucapan ulang tahun (WIB): sebelum 07.30 menunggu di antrian, lewat 17.00 tidak dikirim lagi.
const BDAY_FROM = "07:30";
const BDAY_UNTIL = "17:00";

// Dijalankan Vercel Cron sekali sehari (sekitar 06.00–06.59 WIB, lihat vercel.json): ulang tahun hari ini.
// Aman dipanggil berulang: per tanggal hanya dimasukkan sekali (dedupe).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Ditolak" }, { status: 401 });
  if (!storeReady) return NextResponse.json({ ok: false });
  const today = todayJkt();
  const people = (await birthdayInfo()).today;
  if (!people.length) return NextResponse.json({ ok: true, birthdays: 0 });
  const queued = await notify(
    "ulang_tahun",
    { nama: people.map((p) => p.nama).join(", "), panggilan: people.map((p) => p.short).join(", "), link: "/" },
    "Sistem K2 (otomatis)",
    { notBefore: todayAtWib(BDAY_FROM), expires: todayAtWib(BDAY_UNTIL), dedupe: `ultah|${today}` },
  );
  return NextResponse.json({ ok: true, birthdays: people.length, queued });
}
