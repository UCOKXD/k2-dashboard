import HomeDashboard from "@/components/HomeDashboard";
import { daysUntil, eventsFrom, todayJkt } from "@/lib/acara";
import { buildLogs, buildPelanggaran, pelRows } from "@/lib/dashboard";
import { getActivity, getContent } from "@/lib/content-server";
import { getTable } from "@/lib/sheets";
import { bannerSlides } from "@/lib/photos";
import { recentDoaPicks } from "@/lib/store";
import { STUDENTS } from "@/lib/students";

export const revalidate = 30;

export default async function Home() {
  const [pel, sakit, izin, acara, doa, ov, org, slides, activity, birthdays, schedule, gallery] = await Promise.all([
    getTable("pelanggaran"),
    getTable("sakit"),
    getTable("izin"),
    getTable("acara"),
    recentDoaPicks(),
    getContent("pelanggaran"),
    getContent("org"),
    getContent("slides"),
    getActivity(),
    getContent("birthdays"),
    getContent("schedule"),
    getContent("gallery"),
  ]);

  const today = todayJkt();

  // Acara terdekat (hari ini atau yang akan datang).
  const nextEvent =
    eventsFrom(acara)
      .map((e) => ({ ...e, days: daysUntil(e.date, today) }))
      .filter((e) => e.days >= 0)
      .sort((a, b) => a.days - b.days)[0] ?? null;

  // Petugas doa hari ini = hasil acak terakhir yang tanggalnya hari ini.
  const doaToday = [...doa].reverse().find((p) => new Date(p.at).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }) === today) ?? null;

  // Ulang tahun hari ini & 7 hari ke depan.
  const year = Number(today.slice(0, 4));
  const ultah = Object.entries(birthdays)
    .map(([nama, mmdd]) => {
      let days = daysUntil(`${year}-${mmdd}`, today);
      if (days < 0) days = daysUntil(`${year + 1}-${mmdd}`, today);
      return { nama, short: STUDENTS.find((s) => s.full === nama)?.short ?? nama, mmdd, days };
    })
    .filter((b) => b.days <= 7)
    .sort((a, b) => a.days - b.days);

  return (
    <HomeDashboard
      data={{
        stats: { totalSakit: sakit.rows.length },
        pelanggaran: buildPelanggaran(pel, ov),
        logs: buildLogs({ pelanggaran: pelRows(pel, ov), sakit, izin, acara }, doa, activity),
        org,
        slides: bannerSlides(slides, gallery), // acak dari galeri kalau galeri sudah berisi
        cards: { nextEvent, doaToday, ultah, schedule },
      }}
    />
  );
}
