"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

// Mode Timer panel jam (menggantikan kartu WIB/WITA/WIT). Angka timer sebesar angka jam; di bawahnya isian jam/menit/detik,
// pilihan cepat, lalu Mulai & Ulang. Tombol tembus pandang dengan teks kecil tebal supaya foto latar tetap terlihat.

const pad = (n: number) => String(n).padStart(2, "0");
const hms = (ms: number) => {
  const t = Math.max(0, ms);
  return `${pad(Math.floor(t / 3_600_000))}:${pad(Math.floor((t % 3_600_000) / 60_000))}:${pad(Math.floor((t % 60_000) / 1000))}`;
};

export const BTN = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-k2-md border px-4 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40";
export const SOFT = `${BTN} border-white/25 bg-white/[0.12] text-white hover:bg-white/[0.22] active:bg-white/30`;
export const MAIN = `${BTN} border-white/40 bg-white/[0.24] text-white hover:bg-white/[0.34] active:bg-white/40`;
const SHADOW = { textShadow: "0 3px 14px rgba(11,30,61,0.85)" };

// Alarm 5 detik: bip dua nada berselang, dibuat dengan Web Audio (tanpa file suara).
// AudioContext dibuat saat tombol Mulai ditekan supaya browser mengizinkan bunyi.
function useAlarm() {
  const ctx = useRef<AudioContext | null>(null);
  const live = useRef<OscillatorNode[]>([]);
  const prime = () => {
    try {
      ctx.current ??= new AudioContext();
      void ctx.current.resume();
    } catch {}
  };
  const stop = () => {
    live.current.forEach((o) => {
      try {
        o.stop();
      } catch {}
    });
    live.current = [];
  };
  const ring = () => {
    const c = ctx.current;
    if (!c) return;
    stop();
    for (let at = 0; at < 5; at += 0.5) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "square";
      o.frequency.value = (at * 2) % 2 ? 1175 : 880;
      const t = c.currentTime + at;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 0.34);
      live.current.push(o);
    }
  };
  useEffect(() => () => stop(), []);
  return { prime, ring, stop };
}

// Waktu dihitung dari selisih Date.now(), jadi tetap tepat walau tab sempat di belakang.
function useTick(on: boolean, every = 200) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(id);
  }, [on, every]);
  return now;
}

const PRESETS = [5, 10, 15, 30, 60, 90, 120];
const num = (v: string, max: number) => Math.min(max, Number(v.replace(/\D/g, "").slice(-2)) || 0);

// Status timer dipegang TimeClock, jadi timer tetap berjalan saat pindah ke mode Jam.
export function useCountdown() {
  const [set, setSet] = useState({ h: 0, m: 5, s: 0 });
  const total = (set.h * 3600 + set.m * 60 + set.s) * 1000;
  const [left, setLeft] = useState<number | null>(null); // null = belum mulai (angka masih bisa diubah)
  const [endAt, setEndAt] = useState<number | null>(null);
  const [span, setSpan] = useState(0); // panjang putaran yang sedang berjalan
  const [done, setDone] = useState(false);
  const alarm = useAlarm();
  const now = useTick(endAt !== null);

  const remaining = endAt !== null ? Math.max(0, Math.min(span, endAt - now)) : (left ?? total);

  useEffect(() => {
    if (endAt === null) return;
    const id = setTimeout(() => {
      setEndAt(null);
      setLeft(0);
      setDone(true);
      alarm.ring();
    }, endAt - Date.now());
    return () => clearTimeout(id);
  }, [endAt]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    set,
    total,
    remaining,
    running: endAt !== null,
    editing: left === null && endAt === null,
    resumable: left !== null && left > 0,
    done,
    setPart: (k: "h" | "m" | "s", v: string) => setSet((o) => ({ ...o, [k]: num(v, k === "h" ? 99 : 59) })),
    reset(min?: number) {
      alarm.stop();
      setEndAt(null);
      setLeft(null);
      setDone(false);
      if (min !== undefined) setSet({ h: Math.floor(min / 60), m: min % 60, s: 0 });
    },
    start() {
      if (remaining <= 0) return;
      alarm.prime();
      setDone(false);
      setSpan(remaining);
      setEndAt(Date.now() + remaining);
    },
    pause() {
      setLeft(Math.max(0, (endAt ?? 0) - Date.now()));
      setEndAt(null);
    },
  };
}
export type Countdown = ReturnType<typeof useCountdown>;

const PART = [
  ["h", "Jam"],
  ["m", "Menit"],
  ["s", "Detik"],
] as const;

export default function TimerFace({ t, big, digitClass }: { t: Countdown; big: boolean; digitClass: string }) {
  return (
    <div className="flex w-full flex-col items-center">
      <p className={`font-mono font-extrabold leading-none tabular-nums tracking-[-0.04em] ${digitClass} ${t.done ? "text-[#ff8a8a]" : ""}`} style={SHADOW}>
        {hms(t.remaining + (t.running ? 999 : 0))}
      </p>
      <p className="mt-2 min-h-5 text-sm font-bold text-[#ffb4b4]" aria-live="assertive">
        {t.done ? "Waktu habis!" : ""}
      </p>

      {/* Isian jam/menit/detik: bisa diubah selama timer belum dimulai. */}
      <div className="mt-2 flex justify-center gap-2.5" role="group" aria-label="Atur lama timer">
        {PART.map(([k, label]) => (
          <label key={k} className="flex flex-col items-center gap-1.5">
            <input
              value={String(t.set[k])}
              onChange={(e) => t.setPart(k, e.target.value)}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              aria-label={`${label} timer`}
              disabled={!t.editing}
              className={`h-12 rounded-k2-md border border-white/25 bg-white/[0.12] text-center font-mono font-bold tabular-nums text-white outline-none transition focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50 ${big ? "w-24 text-2xl" : "w-[72px] text-xl"}`}
            />
            <span className="text-xs font-bold text-[#dbe5f0]" style={SHADOW}>
              {label}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4 flex max-w-full flex-wrap justify-center gap-2" role="group" aria-label="Pilihan cepat">
        {PRESETS.map((m) => {
          const on = t.editing && t.total === m * 60_000;
          return (
            <button key={m} type="button" onClick={() => t.reset(m)} aria-pressed={on} className={`${on ? MAIN : SOFT} px-3.5`}>
              {m} menit
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {t.running ? (
          <button type="button" onClick={t.pause} className={`${MAIN} px-6`}>
            <Pause size={15} aria-hidden="true" /> Jeda
          </button>
        ) : (
          <button type="button" onClick={t.start} disabled={t.remaining <= 0} className={`${MAIN} px-6`}>
            <Play size={15} aria-hidden="true" /> {t.resumable ? "Lanjut" : "Mulai"}
          </button>
        )}
        <button type="button" onClick={() => t.reset()} disabled={t.editing && !t.done} className={`${SOFT} px-5`}>
          <RotateCcw size={15} aria-hidden="true" /> Ulang
        </button>
      </div>
    </div>
  );
}
