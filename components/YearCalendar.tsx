"use client";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { hasSkb, holidaysOf, type Holiday } from "@/lib/holidays";

import type { CalEvent } from "@/lib/acara";

const FIRST_YEAR = 2026;
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

// Sel kosong di awal bulan (minggu dimulai hari Minggu) lalu tanggal 1..akhir bulan.
function monthCells(y: number, m: number) {
  const lead = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)] as (number | null)[];
}

function useYearData(year: number, events: CalEvent[]) {
  return useMemo(() => {
    const hol = new Map<string, Holiday>();
    for (const h of holidaysOf(year)) hol.set(h.date, h);
    const ev = new Map<string, CalEvent[]>();
    for (const e of events) if (e.date.startsWith(`${year}-`)) ev.set(e.date, [...(ev.get(e.date) ?? []), e]);
    return { hol, ev };
  }, [year, events]);
}

// Warna angka tanggal: merah untuk Minggu & libur nasional, merah muda untuk cuti bersama, hitam untuk hari biasa.
function dayTone(dow: number, h?: Holiday) {
  if (h && !h.cuti) return "text-red-600";
  if (dow === 0) return "text-red-600";
  if (h?.cuti) return "text-rose-400";
  return "text-slate-900";
}

export default function YearCalendar({ events, today }: { events: CalEvent[]; today: string }) {
  const [ty, tm] = today.split("-").map(Number);
  const [year, setYear] = useState(Math.max(ty, FIRST_YEAR));
  const [month, setMonth] = useState(ty < FIRST_YEAR ? 0 : tm - 1);
  const [view, setView] = useState<"bulan" | "tahun">("bulan");
  const { hol, ev } = useYearData(year, events);

  function shift(n: number) {
    const t = year * 12 + month + n;
    if (Math.floor(t / 12) < FIRST_YEAR) return;
    setYear(Math.floor(t / 12));
    setMonth(t % 12);
  }

  const monthHol = holidaysOf(year).filter((h) => Number(h.date.slice(5, 7)) === month + 1);
  const monthEv = [...ev.entries()].filter(([d]) => Number(d.slice(5, 7)) === month + 1).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => (view === "bulan" ? shift(-1) : setYear((y) => Math.max(FIRST_YEAR, y - 1)))}
            disabled={view === "bulan" ? year === FIRST_YEAR && month === 0 : year === FIRST_YEAR}
            className="rounded-full border border-slate-200 bg-white p-2 shadow-[0_6px_16px_rgba(15,23,42,0.15)] transition hover:bg-sea-50 disabled:opacity-40"
            aria-label="Sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="min-w-[11rem] text-center text-xl font-extrabold text-navy-900">{view === "bulan" ? `${MONTHS[month]} ${year}` : year}</p>
          <button
            onClick={() => (view === "bulan" ? shift(1) : setYear((y) => y + 1))}
            className="rounded-full border border-slate-200 bg-white p-2 shadow-[0_6px_16px_rgba(15,23,42,0.15)] transition hover:bg-sea-50"
            aria-label="Berikutnya"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => {
              setYear(Math.max(ty, FIRST_YEAR));
              setMonth(ty < FIRST_YEAR ? 0 : tm - 1);
            }}
            className="ml-1 rounded-full bg-navy-900 px-3.5 py-2 text-xs font-semibold text-white shadow"
          >
            Hari ini
          </button>
        </div>
        <div className="flex gap-1 rounded-full border border-slate-200 bg-slate-100 p-1">
          {(
            [
              ["bulan", "Bulan", CalendarDays],
              ["tahun", "Setahun", LayoutGrid],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${view === id ? "bg-white text-sea-600 shadow" : "text-slate-600"}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span><b className="text-red-600">Merah</b>: Minggu & libur nasional</span>
        <span><b className="text-rose-400">Merah muda</b>: cuti bersama</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sea-500" /> Acara kelas</span>
        {!hasSkb(year) && <span className="font-semibold text-amber-700">SKB libur {year} belum terbit: baru libur bertanggal tetap.</span>}
      </div>

      {view === "bulan" ? (
        <>
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/70 backdrop-blur-md shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {DAYS.map((d, i) => (
                <div key={d} className={`py-2.5 text-center text-xs font-bold uppercase tracking-wider ${i === 0 ? "text-red-600" : "text-slate-500"}`}>
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthCells(year, month).map((d, i) => {
                if (d === null) return <div key={`x${i}`} className="min-h-20 border-b border-r border-slate-100 bg-slate-50/50 sm:min-h-28" />;
                const k = key(year, month, d);
                const h = hol.get(k);
                const es = ev.get(k) ?? [];
                const isToday = k === today;
                return (
                  <div key={k} className={`min-h-20 border-b border-r border-slate-100 p-1.5 sm:min-h-28 sm:p-2 ${h && !h.cuti ? "bg-red-50/60" : h?.cuti ? "bg-rose-50/40" : ""}`}>
                    <span className={`inline-grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${isToday ? "bg-sea-500 text-white shadow-md" : dayTone(i % 7, h)}`}>{d}</span>
                    {h && <p className={`mt-0.5 line-clamp-2 text-[10px] font-semibold leading-tight sm:text-[11px] ${h.cuti ? "text-rose-400" : "text-red-600"}`}>{h.name}</p>}
                    {es.map((e, j) => (
                      <p key={j} title={e.detail || e.title} className="mt-1 truncate rounded-md bg-sea-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:text-[11px]">
                        {e.title}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-md p-5 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
              <h3 className="mb-3 font-bold text-slate-800">Acara bulan ini</h3>
              {monthEv.length === 0 && <p className="text-sm text-slate-400">Belum ada acara.</p>}
              <ul className="space-y-2">
                {monthEv.flatMap(([d, es]) =>
                  es.map((e, j) => (
                    <li key={d + j} className="flex gap-3 text-sm">
                      <span className="w-8 shrink-0 font-bold text-sea-600">{Number(d.slice(8))}</span>
                      <span>
                        <b className="text-slate-800">{e.title}</b>
                        {e.detail && <span className="block text-xs text-slate-500">{e.detail}</span>}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-md p-5 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
              <h3 className="mb-3 font-bold text-slate-800">Libur & cuti bersama bulan ini</h3>
              {monthHol.length === 0 && <p className="text-sm text-slate-400">Tidak ada libur nasional.</p>}
              <ul className="space-y-2">
                {monthHol.map((h) => (
                  <li key={h.date} className="flex gap-3 text-sm">
                    <span className={`w-8 shrink-0 font-bold ${h.cuti ? "text-rose-400" : "text-red-600"}`}>{Number(h.date.slice(8))}</span>
                    <span className={h.cuti ? "text-rose-500" : "text-red-700"}>{h.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MONTHS.map((name, m) => (
            <button
              key={name}
              onClick={() => {
                setMonth(m);
                setView("bulan");
              }}
              className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-md p-3 text-left shadow-[0_16px_36px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:border-sea-300"
            >
              <p className="mb-2 font-bold text-navy-900">{name}</p>
              <div className="grid grid-cols-7 gap-y-0.5 text-center text-[11px]">
                {DAYS.map((d, i) => (
                  <span key={d} className={`font-bold ${i === 0 ? "text-red-600" : "text-slate-400"}`}>
                    {d[0]}
                  </span>
                ))}
                {monthCells(year, m).map((d, i) => {
                  if (d === null) return <span key={`x${i}`} />;
                  const k = key(year, m, d);
                  const h = hol.get(k);
                  return (
                    <span key={k} title={[h?.name, ...(ev.get(k) ?? []).map((e) => e.title)].filter(Boolean).join(" · ") || undefined} className="relative grid place-items-center py-0.5">
                      <span className={`grid h-6 w-6 place-items-center rounded-full font-semibold ${k === today ? "bg-sea-500 text-white" : dayTone(i % 7, h)}`}>{d}</span>
                      {ev.has(k) && <span className="absolute bottom-0 h-1 w-1 rounded-full bg-sea-500" />}
                    </span>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
