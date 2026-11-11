"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

// Timer & stopwatch di dalam panel jam (menggantikan kartu WIB/WITA/WIT).
// Tombol tembus pandang dengan teks kecil tebal supaya foto latar tetap terlihat; area sentuh tetap 44 px.

const pad = (n: number) => String(n).padStart(2, "0");
function clock(ms: number, centi = false) {
  const t = Math.max(0, ms);
  const h = Math.floor(t / 3_600_000);
  const m = Math.floor((t % 3_600_000) / 60_000);
  const s = Math.floor((t % 60_000) / 1000);
  const cs = Math.floor((t % 1000) / 10);
  return `${h ? `${pad(h)}:` : ""}${pad(m)}:${pad(s)}${centi ? `.${pad(cs)}` : ""}`;
}

const BTN = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-k2-md border px-4 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40";
const SOFT = `${BTN} border-white/25 bg-white/[0.12] text-white hover:bg-white/[0.22] active:bg-white/30`;
const MAIN = `${BTN} border-white/40 bg-white/[0.24] text-white hover:bg-white/[0.34] active:bg-white/40`;
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

const PRESETS = [5, 10, 15];
const num = (v: string, max: number) => String(Math.min(max, Number(v.replace(/\D/g, "").slice(-3)) || 0));

function Countdown({ big }: { big: boolean }) {
  const [min, setMin] = useState("5");
  const [sec, setSec] = useState("0");
  const total = (Number(min) * 60 + Number(sec)) * 1000;
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

  function reset(ms?: number) {
    alarm.stop();
    setEndAt(null);
    setLeft(null);
    setDone(false);
    if (ms !== undefined) {
      setMin(String(ms / 60_000));
      setSec("0");
    }
  }
  function start() {
    if (remaining <= 0) return;
    alarm.prime();
    setDone(false);
    setSpan(remaining);
    setEndAt(Date.now() + remaining);
  }
  function pause() {
    setLeft(Math.max(0, (endAt ?? 0) - Date.now()));
    setEndAt(null);
  }

  const editing = left === null && endAt === null;
  const digit = big ? "text-[clamp(52px,min(8vw,12vh),110px)]" : "text-[clamp(44px,7vw,64px)]";
  const field = `w-[2.3ch] bg-transparent text-center font-mono font-extrabold leading-none tabular-nums text-white outline-none ${digit} rounded-k2-md focus-visible:ring-2 focus-visible:ring-white`;

  return (
    <div className="flex flex-col items-center">
      {editing ? (
        <div className="flex items-start justify-center gap-1" style={SHADOW}>
          <label className="flex flex-col items-center">
            <input value={pad(Number(min))} onChange={(e) => setMin(num(e.target.value, 999))} onFocus={(e) => e.target.select()} inputMode="numeric" className={field} />
            <span className="mt-1 text-xs font-bold text-[#c9d6e6]">Menit</span>
          </label>
          <span className={`font-mono font-extrabold leading-none ${digit}`} aria-hidden="true">
            :
          </span>
          <label className="flex flex-col items-center">
            <input value={pad(Number(sec))} onChange={(e) => setSec(num(e.target.value, 59))} onFocus={(e) => e.target.select()} inputMode="numeric" className={field} />
            <span className="mt-1 text-xs font-bold text-[#c9d6e6]">Detik</span>
          </label>
        </div>
      ) : (
        <p className={`font-mono font-extrabold leading-none tabular-nums ${digit} ${done ? "text-[#ff8a8a]" : ""}`} style={SHADOW}>
          {clock(remaining + (endAt !== null ? 999 : 0))}
        </p>
      )}
      <p className="mt-2 min-h-5 text-sm font-bold text-[#ffb4b4]" aria-live="assertive">
        {done ? "Waktu habis!" : ""}
      </p>

      <div className="mt-2 flex justify-center gap-2">
        {endAt === null ? (
          <button type="button" onClick={start} disabled={remaining <= 0} className={MAIN}>
            <Play size={14} aria-hidden="true" /> {left !== null && left > 0 ? "Lanjut" : "Mulai"}
          </button>
        ) : (
          <button type="button" onClick={pause} className={MAIN}>
            <Pause size={14} aria-hidden="true" /> Jeda
          </button>
        )}
        <button type="button" onClick={() => reset()} disabled={editing && !done} className={SOFT}>
          <RotateCcw size={14} aria-hidden="true" /> Ulang
        </button>
      </div>
      <div className="mt-3 flex justify-center gap-2" role="group" aria-label="Pilihan cepat">
        {PRESETS.map((m) => {
          const on = editing && total === m * 60_000;
          return (
            <button key={m} type="button" onClick={() => reset(m * 60_000)} aria-pressed={on} className={`${on ? MAIN : SOFT} px-3`}>
              {m} menit
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stopwatch({ big }: { big: boolean }) {
  const [base, setBase] = useState(0);
  const [startAt, setStartAt] = useState<number | null>(null);
  const now = useTick(startAt !== null, 47);
  const elapsed = base + (startAt !== null ? Math.max(0, now - startAt) : 0);
  const digit = big ? "text-[clamp(52px,min(8vw,12vh),110px)]" : "text-[clamp(44px,7vw,64px)]";

  return (
    <div className="flex flex-col items-center">
      <p className={`font-mono font-extrabold leading-none tabular-nums ${digit}`} style={SHADOW}>
        {clock(elapsed, true)}
      </p>
      <p className="mt-2 min-h-5" aria-hidden="true" />
      <div className="mt-2 flex justify-center gap-2">
        {startAt === null ? (
          <button type="button" onClick={() => setStartAt(Date.now())} className={MAIN}>
            <Play size={14} aria-hidden="true" /> {elapsed ? "Lanjut" : "Mulai"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setBase(base + Date.now() - startAt);
              setStartAt(null);
            }}
            className={MAIN}
          >
            <Pause size={14} aria-hidden="true" /> Jeda
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setBase(0);
            setStartAt(null);
          }}
          disabled={!elapsed}
          className={SOFT}
        >
          <RotateCcw size={14} aria-hidden="true" /> Ulang
        </button>
      </div>
    </div>
  );
}

const TABS = [
  ["timer", "Timer"],
  ["stopwatch", "Stopwatch"],
] as const;

export default function ClockTools({ big = false }: { big?: boolean }) {
  const [tab, setTab] = useState<"timer" | "stopwatch">("timer");

  // Panah kiri/kanan berpindah tab (pola tablist WAI-ARIA).
  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = tab === "timer" ? "stopwatch" : "timer";
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  return (
    <div className={`mx-auto mt-6 w-full rounded-k2-lg border border-white/[0.14] bg-[rgba(6,18,39,0.62)] px-4 pb-5 pt-3 ${big ? "max-w-2xl" : "max-w-md"}`}>
      <div role="tablist" aria-label="Pilih alat" onKeyDown={onKey} className="mb-4 flex justify-center gap-1.5">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            id={`tab-${id}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            className={`${tab === id ? MAIN : `${SOFT} text-[#c9d6e6]`} px-3.5`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Keduanya tetap terpasang supaya timer tidak berhenti saat pindah tab. */}
      <div id="panel-timer" role="tabpanel" aria-labelledby="tab-timer" hidden={tab !== "timer"}>
        <Countdown big={big} />
      </div>
      <div id="panel-stopwatch" role="tabpanel" aria-labelledby="tab-stopwatch" hidden={tab !== "stopwatch"}>
        <Stopwatch big={big} />
      </div>
    </div>
  );
}
