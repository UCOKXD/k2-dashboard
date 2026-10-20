import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";
import YearCalendar from "@/components/YearCalendar";
import WeekCalendar from "@/components/WeekCalendar";
import TaskBoard from "@/components/TaskBoard";
import AdminLink from "@/components/AdminLink";
import { eventsFrom, todayJkt } from "@/lib/acara";
import { getContent } from "@/lib/content-server";
import { STUDENTS } from "@/lib/students";
import { urgencyOf } from "@/lib/tasks";

export const revalidate = 30;

export default async function Page() {
  const [t, birthdays, schedule, tasks] = await Promise.all([getTable("acara"), getContent("birthdays"), getContent("schedule"), getContent("tasks")]);
  const bdays = Object.entries(birthdays).map(([nama, mmdd]) => ({ nama, mmdd, short: STUDENTS.find((s) => s.full === nama)?.short ?? nama }));

  const events = eventsFrom(t);

  const today = todayJkt();
  // Stiker DEADLINE! tampil di kotak URGENT; kalau ada, tabel kosong di bawah tidak memakai stiker lagi.
  const hasUrgent = tasks.some((x) => urgencyOf(x, today).level === "urgent");

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Kalender Acara</h2>
        <AdminLink href="/admin?tab=tugas" label="Kelola tugas" perm="tugas" />
      </div>
      <TaskBoard tasks={tasks} today={today} />
      <WeekCalendar events={events} today={today} birthdays={bdays} schedule={schedule} tasks={tasks} />
      <YearCalendar events={events} today={today} birthdays={bdays} schedule={schedule} tasks={tasks} />
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Daftar acara dari form</h3>
        <DataTable head="bg-sea-100 text-navy-900" cols={t.cols} rows={t.rows} emptySticker={!hasUrgent} />
      </div>
      {/* Tombol saran acara untuk semua pengunjung: besar, semi-transparan, melayang di pojok kanan bawah. */}
      <a
        href="https://forms.gle/w9G7tBxWwaLBW6y59"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-30 md:bottom-6 md:right-6 flex items-center gap-2 rounded-full border border-white/15 bg-navy-900 px-7 py-4 text-base font-bold text-white shadow-3 transition hover:scale-105 hover:bg-sea-600"
      >
        <span className="text-xl leading-none">+</span> Saran acara
      </a>
    </div>
  );
}
