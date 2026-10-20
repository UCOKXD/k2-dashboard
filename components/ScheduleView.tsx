"use client";
import { useEffect, useState } from "react";
import { ArrowDown, MapPin, User } from "lucide-react";
import { HARI, type ScheduleItem } from "@/lib/content";
import { jam } from "@/lib/time";
import Sticker from "@/components/Sticker";
import { jktParts, useServerOffset } from "@/components/useServerOffset";

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Jadwal mingguan Senin-Sabtu; hari ini, kelas yang sedang berlangsung, dan kelas yang selesai ditandai
// menurut jam Jakarta dari server (bukan jam perangkat).
export default function ScheduleView({ schedule }: { schedule: ScheduleItem[] }) {
  const offset = useServerOffset();
  const [tick, setTick] = useState<number | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setTick(Date.now()));
    const id = setInterval(() => setTick(Date.now()), 30_000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, []);
  const now = tick === null ? null : jktParts(tick + offset);

  if (!schedule.length)
    return (
      <div className="k2-card flex items-center gap-4 p-5 text-sm text-ink-2">
        <Sticker name="belum-ada-data" size={120} />
        <p>Jadwal kuliah belum diisi admin.</p>
      </div>
    );

  const days = [1, 2, 3, 4, 5, 6].filter((d) => schedule.some((s) => s.day === d));
  const todayShown = now !== null && days.includes(now.day);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 text-[13px] text-ink-3">
          <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-[3px] bg-accent" />Hari ini</span>
          <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-[3px] bg-ok" />Sedang berlangsung</span>
          <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-[3px] border border-dashed border-line-strong" />Selesai</span>
        </div>
        {todayShown && (
          <a href={`#hari-${now.day}`} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 text-[13px] font-semibold text-ink hover:border-ink-3">
            <ArrowDown size={15} /> Lompat ke hari ini
          </a>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {days.map((d) => {
          const isToday = now?.day === d;
          const list = schedule.filter((s) => s.day === d).sort((a, b) => toMin(a.start) - toMin(b.start));
          return (
            <article
              key={d}
              id={`hari-${d}`}
              aria-current={isToday ? "date" : undefined}
              className={`scroll-mt-36 rounded-k2-lg border bg-surface p-5 ${isToday ? "border-2 border-accent shadow-[0_0_0_3px_var(--accent-soft),var(--shadow-2)]" : "border-line shadow-1"}`}
            >
              <div className="mb-3.5 flex items-center justify-between">
                <h2 className="text-[22px] font-bold">{HARI[d]}</h2>
                {isToday && <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink">Hari ini</span>}
              </div>
              <ul className="flex flex-col gap-2">
                {list.map((s) => {
                  const live = isToday && now !== null && toMin(s.start) <= now.min && now.min < toMin(s.end);
                  const done = isToday && now !== null && now.min >= toMin(s.end);
                  return (
                    <li
                      key={s.id}
                      className={`rounded-k2-md border px-3.5 py-3 ${
                        live ? "border-ok/40 bg-ok-soft" : done ? "border-dashed border-line-strong bg-transparent" : "border-transparent bg-surface-2"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2.5">
                        <p className={`text-[15px] ${done ? "font-semibold text-ink-2" : "font-bold text-ink"}`}>{s.matkul}</p>
                        <span className={`shrink-0 whitespace-nowrap font-mono text-xs font-semibold ${done ? "text-ink-2" : "text-ink-3"}`}>
                          {jam(s.start)}–{jam(s.end)}
                        </span>
                      </div>
                      <div className={`mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] ${done ? "text-ink-2" : "text-ink-3"}`}>
                        {s.ruang && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} /> {s.ruang}
                          </span>
                        )}
                        {s.dosen && (
                          <span className="inline-flex items-center gap-1">
                            <User size={12} /> {s.dosen}
                          </span>
                        )}
                        {live && <span className="font-bold text-ok">Sedang berlangsung</span>}
                        {done && <span className="sr-only">Selesai</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
