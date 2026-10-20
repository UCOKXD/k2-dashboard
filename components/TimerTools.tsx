"use client";
import { useEffect, useState } from "react";
import { Flag, Pause, Play, RotateCcw, Timer, Watch } from "lucide-react";
import Sticker from "@/components/Sticker";
import SectionHead from "@/components/SectionHead";

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

const btn = "flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45";
// Tombol utama navy (gelap: biru laut), tombol kedua bergaris. Warna dipatok supaya tidak ikut pemetaan ulang tema lama.
const primary = `${btn} bg-[#0b1e3d] text-white hover:bg-[#1b3a6b] dark:bg-[#2e9be0] dark:text-[#061227] dark:hover:bg-[#8fcff1]`;
const garis = `${btn} border border-line-strong bg-surface text-ink hover:border-ink-3`;

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
      <div className="relative mx-auto grid h-56 w-56 place-items-center sm:h-[260px] sm:w-[260px]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface-2)" strokeWidth="6" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={done ? "var(--bad)" : "var(--accent)"} strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 45} strokeDashoffset={2 * Math.PI * 45 * (1 - pct)} />
        </svg>
        <div className="text-center">
          <p className={`font-mono text-[46px] font-extrabold tracking-[-0.03em] tabular-nums sm:text-[54px] ${done ? "animate-pulse text-bad" : "text-ink"}`}>{clock(remaining + 999)}</p>
          {done && <p className="mt-1 text-sm font-bold text-bad">Waktu habis!</p>}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {[1, 5, 10, 15, 30].map((m) => (
          <button
            key={m}
            onClick={() => set(m * 60_000)}
            aria-pressed={total === m * 60_000}
            className={`min-h-9 rounded-full border px-3.5 text-[13px] font-semibold transition ${total === m * 60_000 ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-surface text-ink hover:border-ink-3"}`}
          >
            {m} menit
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 text-sm">
        <input value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="min-h-10 w-16 rounded-k2-md border border-line-strong bg-surface px-2 text-center font-mono text-ink" aria-label="Menit" />
        <span>menit</span>
        <input value={sec} onChange={(e) => setSec(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="min-h-10 w-16 rounded-k2-md border border-line-strong bg-surface px-2 text-center font-mono text-ink" aria-label="Detik" />
        <span>detik</span>
        <button onClick={apply} className="min-h-10 rounded-full border border-line-strong bg-surface px-4 font-semibold text-ink hover:border-ink-3">Atur</button>
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
            className={primary}
          >
            <Play size={16} /> Mulai
          </button>
        ) : (
          <button
            onClick={() => {
              setLeft(Math.max(0, (endAt ?? 0) - Date.now()));
              setEndAt(null);
            }}
            className={primary}
          >
            <Pause size={16} /> Jeda
          </button>
        )}
        <button onClick={() => set(total)} className={garis}>
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
      <p className="pb-2 pt-7 text-center font-mono text-[clamp(52px,9vw,84px)] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-ink">{clock(elapsed, true)}</p>
      <div className="flex justify-center gap-3">
        {startAt === null ? (
          <button onClick={() => setStartAt(Date.now())} className={primary}>
            <Play size={16} /> {elapsed ? "Lanjut" : "Mulai"}
          </button>
        ) : (
          <button
            onClick={() => {
              setBase(base + Date.now() - (startAt ?? Date.now()));
              setStartAt(null);
            }}
            className={primary}
          >
            <Pause size={16} /> Jeda
          </button>
        )}
        <button onClick={() => setLaps((l) => [base + Date.now() - (startAt ?? Date.now()), ...l])} disabled={startAt === null} className={garis}>
          <Flag size={16} /> Putaran
        </button>
        <button
          onClick={() => {
            setBase(0);
            setStartAt(null);
            setLaps([]);
          }}
          className={garis}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      {laps.length > 0 && (
        <ol className="mx-auto max-h-48 max-w-sm space-y-1 overflow-y-auto text-sm">
          {laps.map((t, i) => (
            <li key={i} className="flex justify-between border-b border-line px-3 py-2 font-mono text-[13px] tabular-nums">
              <span className="text-ink-3">Putaran {laps.length - i}</span>
              <span className="font-semibold">{clock(t, true)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const TABS = [
  ["timer", "Timer", Timer],
  ["stopwatch", "Stopwatch", Watch],
] as const;

export default function TimerTools() {
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
    <section aria-labelledby="judul-alat">
      <SectionHead no="01" label="Alat" title="Timer & stopwatch" id="judul-alat" />
      <div className="k2-card grid items-center gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="w-full min-w-0">
          <div role="tablist" aria-label="Pilih alat" onKeyDown={onKey} className="mx-auto mb-6 flex w-fit gap-1 rounded-full border border-line bg-surface-2 p-1">
            {TABS.map(([id, label, Icon]) => (
              <button
                key={id}
                id={`tab-${id}`}
                role="tab"
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                className={`flex h-[38px] items-center gap-1.5 rounded-full px-[18px] text-sm font-semibold transition ${tab === id ? "bg-surface text-ink shadow-1" : "text-ink-3 hover:text-ink"}`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
          {/* Keduanya tetap terpasang supaya timer tidak berhenti saat pindah tab. */}
          <div id="panel-timer" role="tabpanel" aria-labelledby="tab-timer" hidden={tab !== "timer"}>
            <Countdown />
          </div>
          <div id="panel-stopwatch" role="tabpanel" aria-labelledby="tab-stopwatch" hidden={tab !== "stopwatch"}>
            <Stopwatch />
          </div>
        </div>
        <Sticker name="jangan-telat" size={200} className="hidden md:block" />
      </div>
    </section>
  );
}
