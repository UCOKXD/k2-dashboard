"use client";
import { useEffect, useState } from "react";
import { Flag, Pause, Play, RotateCcw, Timer, Watch } from "lucide-react";

const pad = (n: number) => String(n).padStart(2, "0");
function clock(ms: number, withCenti = false) {
  const t = Math.max(0, ms);
  const h = Math.floor(t / 3_600_000);
  const m = Math.floor((t % 3_600_000) / 60_000);
  const s = Math.floor((t % 60_000) / 1000);
  const cs = Math.floor((t % 1000) / 10);
  return `${h ? `${pad(h)}:` : ""}${pad(m)}:${pad(s)}${withCenti ? `.${pad(cs)}` : ""}`;
}

// Bunyi "bip" tiga kali saat hitung mundur selesai (tanpa file audio).
function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.35, 0.7].forEach((at) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.25, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + 0.3);
    });
  } catch {}
}

// Waktu berjalan dihitung dari selisih Date.now(), jadi tetap akurat walau tab sempat di belakang.
function useNow(running: boolean) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 47);
    return () => clearInterval(id);
  }, [running]);
  return now;
}

const btn = "flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold shadow-[0_10px_22px_rgba(15,23,42,0.22)] transition disabled:opacity-40";

function Countdown() {
  const [total, setTotal] = useState(5 * 60_000);
  const [left, setLeft] = useState(5 * 60_000); // sisa saat dijeda
  const [endAt, setEndAt] = useState<number | null>(null); // waktu selesai saat berjalan
  const [done, setDone] = useState(false);
  const [min, setMin] = useState("5");
  const [sec, setSec] = useState("0");
  const now = useNow(endAt !== null);

  const remaining = endAt !== null ? Math.max(0, Math.min(left, endAt - now)) : left;

  useEffect(() => {
    if (endAt === null) return;
    const id = setTimeout(() => {
      setEndAt(null);
      setLeft(0);
      setDone(true);
      beep();
    }, endAt - Date.now());
    return () => clearTimeout(id);
  }, [endAt]);

  function set(ms: number) {
    setEndAt(null);
    setDone(false);
    setTotal(ms);
    setLeft(ms);
  }
  function apply() {
    const ms = (Math.max(0, Number(min) || 0) * 60 + Math.max(0, Number(sec) || 0)) * 1000;
    if (ms > 0) set(ms);
  }

  const pct = total ? Math.max(0, Math.min(1, remaining / total)) : 0;

  return (
    <div className="space-y-5">
      <div className="relative mx-auto grid h-56 w-56 place-items-center sm:h-64 sm:w-64">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={done ? "#e11d48" : "#2E9BE0"} strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 45} strokeDashoffset={2 * Math.PI * 45 * (1 - pct)} />
        </svg>
        <div className="text-center">
          <p className={`font-mono text-4xl font-black tabular-nums sm:text-5xl ${done ? "animate-pulse text-rose-600" : "text-navy-900"}`}>{clock(remaining + 999)}</p>
          {done && <p className="mt-1 text-sm font-bold text-rose-600">Waktu habis!</p>}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {[1, 5, 10, 15, 30].map((m) => (
          <button key={m} onClick={() => set(m * 60_000)} className="rounded-full border border-sea-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-900 shadow-sm hover:bg-sea-50">
            {m} menit
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 text-sm">
        <input value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="w-16 rounded-lg border border-sea-300 px-2 py-1.5 text-center" aria-label="Menit" />
        <span>menit</span>
        <input value={sec} onChange={(e) => setSec(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="w-16 rounded-lg border border-sea-300 px-2 py-1.5 text-center" aria-label="Detik" />
        <span>detik</span>
        <button onClick={apply} className="rounded-lg bg-navy-900 px-3 py-1.5 font-semibold text-white">Atur</button>
      </div>

      <div className="flex justify-center gap-3">
        {endAt === null ? (
          <button
            onClick={() => {
              if (remaining <= 0) return;
              setDone(false);
              setEndAt(Date.now() + left);
            }}
            disabled={remaining <= 0}
            className={`${btn} bg-sea-500 text-white hover:bg-sea-600`}
          >
            <Play size={16} /> Mulai
          </button>
        ) : (
          <button
            onClick={() => {
              setLeft(Math.max(0, (endAt ?? 0) - Date.now()));
              setEndAt(null);
            }}
            className={`${btn} bg-amber-500 text-white hover:bg-amber-600`}
          >
            <Pause size={16} /> Jeda
          </button>
        )}
        <button onClick={() => set(total)} className={`${btn} border border-slate-200 bg-white text-navy-900 hover:bg-slate-50`}>
          <RotateCcw size={16} /> Ulang
        </button>
      </div>
    </div>
  );
}

function Stopwatch() {
  const [base, setBase] = useState(0); // waktu terkumpul saat dijeda
  const [startAt, setStartAt] = useState<number | null>(null);
  const [laps, setLaps] = useState<number[]>([]);
  const now = useNow(startAt !== null);

  const elapsed = base + (startAt !== null ? Math.max(0, now - startAt) : 0);

  return (
    <div className="space-y-5">
      <p className="py-10 text-center font-mono text-5xl font-black tabular-nums text-navy-900 sm:text-7xl">{clock(elapsed, true)}</p>
      <div className="flex justify-center gap-3">
        {startAt === null ? (
          <button onClick={() => setStartAt(Date.now())} className={`${btn} bg-sea-500 text-white hover:bg-sea-600`}>
            <Play size={16} /> {elapsed ? "Lanjut" : "Mulai"}
          </button>
        ) : (
          <button
            onClick={() => {
              setBase(base + Date.now() - (startAt ?? Date.now()));
              setStartAt(null);
            }}
            className={`${btn} bg-amber-500 text-white hover:bg-amber-600`}
          >
            <Pause size={16} /> Jeda
          </button>
        )}
        <button onClick={() => setLaps((l) => [base + Date.now() - (startAt ?? Date.now()), ...l])} disabled={startAt === null} className={`${btn} border border-slate-200 bg-white text-navy-900 hover:bg-slate-50`}>
          <Flag size={16} /> Putaran
        </button>
        <button
          onClick={() => {
            setBase(0);
            setStartAt(null);
            setLaps([]);
          }}
          className={`${btn} border border-slate-200 bg-white text-navy-900 hover:bg-slate-50`}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      {laps.length > 0 && (
        <ol className="mx-auto max-h-48 max-w-sm space-y-1 overflow-y-auto text-sm">
          {laps.map((t, i) => (
            <li key={i} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5 font-mono tabular-nums">
              <span className="text-slate-500">Putaran {laps.length - i}</span>
              <span className="font-semibold">{clock(t, true)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function TimerTools() {
  const [tab, setTab] = useState<"timer" | "stopwatch">("timer");

  return (
    <div className="rounded-[2rem] border border-slate-200/70 bg-white/70 backdrop-blur-md p-5 shadow-[0_24px_60px_rgba(15,23,42,0.22)] sm:p-8">
      <div className="mx-auto mb-6 flex w-fit gap-1 rounded-full border border-slate-200 bg-slate-100 p-1">
        {(
          [
            ["timer", "Timer", Timer],
            ["stopwatch", "Stopwatch", Watch],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === id ? "bg-white text-sea-600 shadow" : "text-slate-600"}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {/* Keduanya tetap terpasang supaya timer tidak berhenti saat pindah tab. */}
      <div className={tab === "timer" ? "" : "hidden"}>
        <Countdown />
      </div>
      <div className={tab === "stopwatch" ? "" : "hidden"}>
        <Stopwatch />
      </div>
    </div>
  );
}
