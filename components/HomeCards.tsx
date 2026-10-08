"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenCheck, CalendarClock, Cake, GraduationCap } from "lucide-react";
import { HARI, type ScheduleItem } from "@/lib/content";
import { jam } from "@/lib/time";
import type { HomeCards as Cards } from "@/lib/dashboard";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const fmtDate = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
};

// Waktu Jakarta sekarang: hari (0 = Minggu) dan menit sejak tengah malam.
function jktNow() {
  const n = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() };
}
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Kelas yang sedang berlangsung, atau kelas berikutnya dalam 7 hari ke depan.
function nextClass(list: ScheduleItem[], now: { day: number; min: number }) {
  for (let add = 0; add < 7; add++) {
    const day = (now.day + add) % 7;
    const today = list
      .filter((s) => s.day === day && (add > 0 || toMin(s.end) > now.min))
      .sort((a, b) => toMin(a.start) - toMin(b.start));
    if (today[0]) {
      const s = today[0];
      const live = add === 0 && toMin(s.start) <= now.min;
      return { s, live, when: live ? "Sedang berlangsung" : add === 0 ? "Hari ini" : add === 1 ? "Besok" : HARI[day] };
    }
  }
  return null;
}

function Card({ icon: Icon, tone, label, href, children }: { icon: typeof Cake; tone: string; label: string; href?: string; children: React.ReactNode }) {
  const body = (
    <div className="flex h-full gap-3.5 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.2)] backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(15,23,42,0.28)]">
      <div className={`h-fit shrink-0 rounded-2xl border p-3 shadow-md ${tone}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        {children}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export default function HomeCards({ cards }: { cards: Cards }) {
  const [now, setNow] = useState<{ day: number; min: number } | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setNow(jktNow()));
    const id = setInterval(() => setNow(jktNow()), 30_000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, []);

  const kelas = now ? nextClass(cards.schedule, now) : null;
  const { nextEvent, doaToday, ultah } = cards;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card icon={GraduationCap} tone="bg-sky-50 text-sky-600 border-sky-200" label="Kelas berikutnya" href="/jadwal">
        {!cards.schedule.length ? (
          <p className="mt-1 text-sm text-slate-500">Jadwal kuliah belum diisi admin.</p>
        ) : kelas ? (
          <>
            <p className="mt-1 truncate text-lg font-extrabold text-slate-800">{kelas.s.matkul}</p>
            <p className="text-sm text-slate-600">
              <span className={kelas.live ? "font-bold text-emerald-600" : "font-semibold text-sky-600"}>{kelas.when}</span> · {jam(kelas.s.start)}–{jam(kelas.s.end)}
              {kelas.s.ruang && ` · ${kelas.s.ruang}`}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-500">{now ? "Tidak ada kelas minggu ini." : "Memuat..."}</p>
        )}
      </Card>

      <Card icon={CalendarClock} tone="bg-indigo-50 text-indigo-600 border-indigo-200" label="Acara terdekat" href="/kalender-acara">
        {nextEvent ? (
          <>
            <p className="mt-1 truncate text-lg font-extrabold text-slate-800">{nextEvent.title}</p>
            <p className="text-sm text-slate-600">
              <span className="font-bold text-indigo-600">{nextEvent.days === 0 ? "Hari ini!" : nextEvent.days === 1 ? "Besok" : `${nextEvent.days} hari lagi`}</span> ·{" "}
              {fmtDate(nextEvent.date)}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-500">Belum ada acara mendatang.</p>
        )}
      </Card>

      <Card icon={BookOpenCheck} tone="bg-emerald-50 text-emerald-600 border-emerald-200" label="Petugas doa hari ini" href="/doa-harian">
        {doaToday ? (
          <>
            <p className="mt-1 truncate text-lg font-extrabold text-slate-800">{doaToday.name}</p>
            <p className="text-sm text-slate-600">NIM {doaToday.nim}</p>
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-500">Belum diacak hari ini.</p>
        )}
      </Card>

      {/* Ulang tahun hari ini tampil besar di banner beranda; kartu ini untuk yang akan datang. */}
      {ultah.some((u) => u.days > 0) && (
        <div className="sm:col-span-2 lg:col-span-3">
          <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-pink-200/70 bg-gradient-to-r from-pink-50/80 via-rose-50/80 to-amber-50/80 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.18)] backdrop-blur-md">
            <div className="rounded-2xl border border-pink-200 bg-white/80 p-3 text-pink-500 shadow-md">
              <Cake size={22} />
            </div>
            <div className="min-w-0 flex-1">
              {ultah.some((u) => u.days > 0) && (
                <p className="text-sm text-slate-600">
                  Segera ulang tahun:{" "}
                  {ultah
                    .filter((u) => u.days > 0)
                    .map((u) => `${u.short} (${u.days === 1 ? "besok" : `${u.days} hari lagi`})`)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
