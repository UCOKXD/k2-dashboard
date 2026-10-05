"use client";
import { useEffect, useState } from "react";
import { MapPin, User } from "lucide-react";
import { HARI, type ScheduleItem } from "@/lib/content";

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
function jktNow() {
  const n = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() };
}

// Jadwal mingguan Senin-Sabtu; hari ini dan kelas yang sedang berlangsung disorot.
export default function ScheduleView({ schedule }: { schedule: ScheduleItem[] }) {
  const [now, setNow] = useState<{ day: number; min: number } | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setNow(jktNow()));
    const id = setInterval(() => setNow(jktNow()), 30_000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, []);

  if (!schedule.length)
    return <p className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-slate-500 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-md">Jadwal kuliah belum diisi admin.</p>;

  const days = [1, 2, 3, 4, 5, 6].filter((d) => schedule.some((s) => s.day === d));
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {days.map((d) => {
        const isToday = now?.day === d;
        const list = schedule.filter((s) => s.day === d).sort((a, b) => toMin(a.start) - toMin(b.start));
        return (
          <div
            key={d}
            className={`rounded-3xl border p-5 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-md ${isToday ? "border-sea-300 bg-sea-50/80" : "border-white/60 bg-white/70"}`}
          >
            <p className="mb-3 flex items-center justify-between text-lg font-extrabold text-navy-900">
              {HARI[d]}
              {isToday && <span className="rounded-full bg-sea-500 px-2.5 py-0.5 text-xs font-bold text-white">Hari ini</span>}
            </p>
            <ul className="space-y-2.5">
              {list.map((s) => {
                const live = isToday && now && toMin(s.start) <= now.min && now.min < toMin(s.end);
                const done = isToday && now && now.min >= toMin(s.end);
                return (
                  <li
                    key={s.id}
                    className={`rounded-2xl border p-3 shadow-sm ${live ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white/80"} ${done ? "opacity-55" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-800">{s.matkul}</p>
                      <span className="shrink-0 font-mono text-xs font-semibold text-slate-500">
                        {s.start}–{s.end}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                      {s.ruang && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {s.ruang}
                        </span>
                      )}
                      {s.dosen && (
                        <span className="flex items-center gap-1">
                          <User size={11} /> {s.dosen}
                        </span>
                      )}
                      {live && <span className="font-bold text-emerald-600">Sedang berlangsung</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
