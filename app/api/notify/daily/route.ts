import { NextResponse } from "next/server";
import { todayJkt } from "@/lib/acara";
import { birthdayInfo } from "@/lib/birthday";
import { endOfTodayWib, notify } from "@/lib/notify";
import { storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

// Dijalankan Vercel Cron sekali sehari (pagi WIB, lihat vercel.json): ulang tahun hari ini.
// Aman dipanggil berulang: per tanggal hanya dimasukkan sekali (dedupe), dan kedaluwarsa di akhir hari.
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
    { expires: endOfTodayWib(), dedupe: `ultah|${today}` },
  );
  return NextResponse.json({ ok: true, birthdays: people.length, queued });
}
