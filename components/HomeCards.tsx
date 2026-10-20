"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenCheck, CalendarClock, Cake, GraduationCap } from "lucide-react";
import { HARI, type ScheduleItem } from "@/lib/content";
import { jam } from "@/lib/time";
import type { HomeCards as Cards } from "@/lib/dashboard";
import { jktParts, useServerOffset } from "@/components/useServerOffset";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const fmtDate = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
};

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

// Satu kolom di strip "Hari ini" (desain v2): ikon, label mono, isi, seluruhnya bisa diklik.
function Card({ icon: Icon, label, href, children }: { icon: typeof Cake; label: string; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex min-w-0 gap-4 border-line p-[clamp(18px,2.4vw,28px)] transition-colors hover:bg-surface-2 [&+&]:border-t min-[900px]:[&+&]:border-l min-[900px]:[&+&]:border-t-0"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
        <Icon size={22} />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[11px] font-semibold uppercase leading-tight tracking-[0.1em] text-ink-3">{label}</span>
        {children}
      </span>
    </Link>
  );
}

const VAL = "mt-1.5 block truncate font-display text-[19px] font-bold leading-tight tracking-[-0.01em] text-ink";
const META = "mt-1 block text-[13.5px] text-ink-3";

export default function HomeCards({ cards }: { cards: Cards }) {
  // Jam Jakarta dari server (bukan jam perangkat), diperbarui tiap 30 detik.
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

  const kelas = now ? nextClass(cards.schedule, now) : null;
  const { nextEvent, doaToday, ultah } = cards;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 overflow-hidden rounded-k2-xl border border-line bg-surface shadow-3 min-[900px]:grid-cols-3">
        <Card icon={GraduationCap} label="Kelas berikutnya" href="/jadwal">
          {!cards.schedule.length ? (
            <span className={META}>Jadwal kuliah belum diisi admin.</span>
          ) : kelas ? (
            <>
              <span className={VAL}>{kelas.s.matkul}</span>
              <span className={META}>
                <b className={kelas.live ? "font-bold text-ok" : "font-semibold text-accent-ink"}>{kelas.when}</b> · <span className="font-mono">{jam(kelas.s.start)}–{jam(kelas.s.end)}</span>
                {kelas.s.ruang && ` · ${kelas.s.ruang}`}
              </span>
            </>
          ) : (
            <span className={META}>{now ? "Tidak ada kelas minggu ini." : "Memuat..."}</span>
          )}
        </Card>

        <Card icon={CalendarClock} label="Acara terdekat" href="/kalender-acara">
          {nextEvent ? (
            <>
              <span className={VAL}>{nextEvent.title}</span>
              <span className={META}>
                <b className="font-bold text-accent-ink">{nextEvent.days === 0 ? "Hari ini!" : nextEvent.days === 1 ? "Besok" : `${nextEvent.days} hari lagi`}</b> ·{" "}
                <span className="font-mono">{fmtDate(nextEvent.date)}</span>
              </span>
            </>
          ) : (
            <span className={META}>Belum ada acara mendatang.</span>
          )}
        </Card>

        <Card icon={BookOpenCheck} label="Petugas doa hari ini" href="/doa-harian">
          {doaToday ? (
            <>
              <span className={VAL}>{doaToday.name}</span>
              <span className={META}>
                NIM <span className="font-mono">{doaToday.nim}</span>
              </span>
            </>
          ) : (
            <span className={META}>Belum diacak hari ini.</span>
          )}
        </Card>
      </div>

      {/* Ulang tahun hari ini tampil besar di banner beranda; kartu ini untuk yang akan datang. */}
      {ultah.some((u) => u.days > 0) && (
        <div>
          <div className="flex flex-wrap items-center gap-4 rounded-k2-lg border border-pink-200/70 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 p-5 shadow-2">
            <div className="rounded-2xl border border-pink-200 bg-surface p-3 text-pink-500 shadow-md">
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
