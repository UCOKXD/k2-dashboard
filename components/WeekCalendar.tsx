"use client";
import { useState } from "react";
import { BookOpen, Cake, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, PartyPopper } from "lucide-react";
import { holidaysOf } from "@/lib/holidays";
import type { CalEvent } from "@/lib/acara";
import type { ScheduleItem } from "@/lib/content";
import { jam } from "@/lib/time";
import { URGENCY, urgencyOf, type TaskItem } from "@/lib/tasks";
import type { Bday } from "@/components/YearCalendar";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Tanggal "YYYY-MM-DD" ditambah n hari (dihitung di UTC supaya tidak terpengaruh zona waktu perangkat).
const addDays = (ymd: string, n: number) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
const dowOf = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};
const label = (ymd: string) => `${Number(ymd.slice(8))} ${BULAN[Number(ymd.slice(5, 7)) - 1]}`;

// Kalender 7 hari (Senin–Minggu): libur, acara, ulang tahun, tenggat tugas, dan jadwal kuliah.
export default function WeekCalendar({
  events,
  today,
  birthdays = [],
  schedule = [],
  tasks = [],
}: {
  events: CalEvent[];
  today: string;
  birthdays?: Bday[];
  schedule?: ScheduleItem[];
  tasks?: TaskItem[];
}) {
  const [offset, setOffset] = useState(0); // 0 = minggu ini
  const monday = addDays(today, -((dowOf(today) + 6) % 7) + offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const hol = new Map<string, string>();
  for (const y of new Set(days.map((d) => Number(d.slice(0, 4))))) for (const h of holidaysOf(y)) hol.set(h.date, h.name);

  const range = `${label(days[0])} – ${label(days[6])} ${days[6].slice(0, 4)}`;

  return (
    <section className="space-y-4 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-md sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
          <CalendarDays size={20} className="text-sea-600" /> {offset === 0 ? "Minggu ini" : offset === 1 ? "Minggu depan" : offset === -1 ? "Minggu lalu" : "Minggu"}
          <span className="text-sm font-semibold text-slate-500">· {range}</span>
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset((o) => o - 1)} className="rounded-full border border-slate-200 bg-white p-1.5 shadow-sm transition hover:bg-sea-50" aria-label="Minggu sebelumnya">
            <ChevronLeft size={16} />
          </button>
          {offset !== 0 && (
            <button onClick={() => setOffset(0)} className="rounded-full bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white shadow">
              Minggu ini
            </button>
          )}
          <button onClick={() => setOffset((o) => o + 1)} className="rounded-full border border-slate-200 bg-white p-1.5 shadow-sm transition hover:bg-sea-50" aria-label="Minggu berikutnya">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((d) => {
          const dow = dowOf(d);
          const isToday = d === today;
          const holiday = hol.get(d);
          const ev = events.filter((e) => e.date === d);
          const bd = birthdays.filter((b) => b.mmdd === d.slice(5));
          const tk = tasks.filter((t) => t.deadline === d && !t.done);
          const kuliah = holiday ? [] : schedule.filter((s) => s.day === dow).sort((a, b) => a.start.localeCompare(b.start));
          const empty = !holiday && !ev.length && !bd.length && !tk.length && !kuliah.length;
          return (
            <div
              key={d}
              className={`flex min-h-[9rem] flex-col gap-1.5 rounded-2xl border p-3 ${isToday ? "border-sea-300 bg-sea-50/80 shadow-[0_10px_24px_rgba(31,125,186,0.2)]" : "border-slate-200 bg-white/80"}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className={`text-sm font-bold ${dow === 0 || holiday ? "text-red-600" : "text-slate-800"}`}>{HARI[dow]}</p>
                <p className={`text-xs font-semibold ${isToday ? "rounded-full bg-sea-500 px-2 py-0.5 text-white" : "text-slate-500"}`}>{isToday ? "Hari ini" : label(d)}</p>
              </div>
              {holiday && <p className="text-xs font-semibold text-red-600">{holiday}</p>}
              {bd.map((b) => (
                <p key={b.nama} className="flex items-center gap-1 text-xs font-semibold text-pink-600">
                  <Cake size={12} className="shrink-0" /> Ultah {b.short}
                </p>
              ))}
              {ev.map((e, i) => (
                <p key={i} className="flex items-start gap-1 text-xs font-semibold text-indigo-600" title={e.detail}>
                  <PartyPopper size={12} className="mt-0.5 shrink-0" /> {e.title}
                </p>
              ))}
              {tk.map((t) => {
                const u = URGENCY[urgencyOf(t, today).level];
                return (
                  <p key={t.id} className="flex items-start gap-1 text-xs font-semibold text-slate-700">
                    <ClipboardList size={12} className="mt-0.5 shrink-0" />
                    <span>
                      <span className={`mr-1 rounded px-1 py-px text-[10px] font-bold ${u.chip}`}>{u.label}</span>
                      {t.judul}
                      {t.jam && ` · ${jam(t.jam)}`}
                    </span>
                  </p>
                );
              })}
              {kuliah.map((s) => (
                <p key={s.id} className="flex items-start gap-1 text-xs text-sea-600">
                  <BookOpen size={12} className="mt-0.5 shrink-0" />
                  <span>
                    <b className="font-mono">{jam(s.start)}</b> {s.matkul}
                  </span>
                </p>
              ))}
              {empty && <p className="text-xs text-slate-400">Tidak ada agenda.</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
