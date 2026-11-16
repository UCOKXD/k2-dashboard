import { NextResponse } from "next/server";
import { todayJkt } from "@/lib/acara";
import { birthdayInfo } from "@/lib/birthday";
import { daysUntil } from "@/lib/acara";
import { getContent } from "@/lib/content-server";
import { taskNotifData } from "@/lib/notif";
import { notify, todayAtWib } from "@/lib/notify";
import { storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

// Jendela kirim ucapan ulang tahun (WIB): sebelum 07.30 menunggu di antrian, lewat 17.00 tidak dikirim lagi.
const BDAY_FROM = "07:30";
const BDAY_UNTIL = "17:00";

// Pengingat deadline tugas: dikirim mulai 07.30 WIB, lewat 21.00 tidak dikirim lagi.
const TASK_FROM = "07:30";
const TASK_UNTIL = "21:00";
const REMIND_DAYS = [3, 2, 1]; // H-3, H-2, H-1

// Dijalankan Vercel Cron sekali sehari (sekitar 06.00–06.59 WIB, lihat vercel.json): ulang tahun hari ini dan pengingat deadline tugas.
// Aman dipanggil berulang: per tanggal hanya dimasukkan sekali (dedupe).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Ditolak" }, { status: 401 });
  if (!storeReady) return NextResponse.json({ ok: false });
  const today = todayJkt();
  // Tugas belum selesai yang deadline-nya 3, 2, atau 1 hari lagi. Per tugas per H-n hanya dimasukkan sekali (dedupe).
  let reminders = 0;
  for (const t of await getContent("tasks")) {
    const days = daysUntil(t.deadline, today);
    if (t.done || !REMIND_DAYS.includes(days)) continue;
    const ok = await notify(
      "tugas_deadline",
      { ...taskNotifData(t), sisa: `H-${days}`, sisa_hari: days === 1 ? "besok" : `${days} hari lagi` },
      "Sistem K2 (otomatis)",
      { notBefore: todayAtWib(TASK_FROM), expires: todayAtWib(TASK_UNTIL), dedupe: `tugasdl|${t.id}|${t.deadline}|${days}` },
    );
    if (ok) reminders++;
  }

  const people = (await birthdayInfo()).today;
  if (!people.length) return NextResponse.json({ ok: true, birthdays: 0, reminders });
  const queued = await notify(
    "ulang_tahun",
    { nama: people.map((p) => p.nama).join(", "), panggilan: people.map((p) => p.short).join(", "), link: "/" },
    "Sistem K2 (otomatis)",
    { notBefore: todayAtWib(BDAY_FROM), expires: todayAtWib(BDAY_UNTIL), dedupe: `ultah|${today}` },
  );
  return NextResponse.json({ ok: true, birthdays: people.length, queued, reminders });
}
