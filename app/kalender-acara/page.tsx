import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";
import YearCalendar from "@/components/YearCalendar";
import { eventsFrom, todayJkt } from "@/lib/acara";
import { getContent } from "@/lib/content-server";
import { STUDENTS } from "@/lib/students";

export const revalidate = 30;

export default async function Page() {
  const [t, birthdays, schedule] = await Promise.all([getTable("acara"), getContent("birthdays"), getContent("schedule")]);
  const bdays = Object.entries(birthdays).map(([nama, mmdd]) => ({ nama, mmdd, short: STUDENTS.find((s) => s.full === nama)?.short ?? nama }));

  const events = eventsFrom(t);

  const today = todayJkt();

  return (
    <div className="space-y-8 pb-16">
      <h2 className="text-2xl font-bold">Kalender Acara</h2>
      <YearCalendar events={events} today={today} birthdays={bdays} schedule={schedule} />
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Daftar acara dari form</h3>
        <DataTable head="bg-sea-100 text-navy-900" cols={t.cols} rows={t.rows} />
      </div>
      {/* Tombol saran acara untuk semua pengunjung: besar, semi-transparan, melayang di pojok kanan bawah. */}
      <a
        href="https://forms.gle/w9G7tBxWwaLBW6y59"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full border border-white/30 bg-navy-900/70 px-7 py-4 text-base font-bold text-white shadow-[0_16px_40px_rgba(11,30,61,0.45)] backdrop-blur-md transition hover:scale-105 hover:bg-sea-600/85"
      >
        <span className="text-xl leading-none">+</span> Saran acara
      </a>
    </div>
  );
}
