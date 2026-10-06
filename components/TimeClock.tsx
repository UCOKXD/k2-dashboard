"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Maximize2, Minimize2, RefreshCw, TriangleAlert } from "lucide-react";

type Sync = { offset: number; accuracy: number }; // offset = waktu server - jam perangkat (ms)

// Ukur selisih jam beberapa kali, ambil yang perjalanan jaringannya paling singkat (paling akurat).
async function measure(): Promise<Sync> {
  let best: Sync | null = null;
  for (let i = 0; i < 6; i++) {
    const t0 = Date.now();
    const res = await fetch(`/api/time?t=${t0}`, { cache: "no-store" });
    const { now } = (await res.json()) as { now: number };
    const t1 = Date.now();
    const rtt = t1 - t0;
    const s = { offset: now + rtt / 2 - t1, accuracy: rtt / 2 };
    if (!best || s.accuracy < best.accuracy) best = s;
  }
  return best!;
}

const ZONES = [
  { label: "WIB", tz: "Asia/Jakarta" },
  { label: "WITA", tz: "Asia/Makassar" },
  { label: "WIT", tz: "Asia/Jayapura" },
];

const part = (d: Date, tz: string, o: Intl.DateTimeFormatOptions) => d.toLocaleString("id-ID", { timeZone: tz, ...o });

function diffText(ms: number) {
  const abs = Math.abs(ms);
  if (abs < 1000) return `${(abs / 1000).toFixed(3).replace(".", ",")} detik`;
  if (abs < 60_000) return `${(abs / 1000).toFixed(1).replace(".", ",")} detik`;
  const m = Math.floor(abs / 60_000);
  const s = Math.round((abs % 60_000) / 1000);
  return `${m} menit ${s} detik`;
}

export default function TimeClock() {
  const [sync, setSync] = useState<Sync | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const run = () =>
    measure()
      .then((s) => {
        setSync(s);
        setFailed(false);
      })
      .catch(() => setFailed(true))
      .finally(() => setBusy(false));

  function resync() {
    setBusy(true);
    run();
  }

  useEffect(() => {
    run();
    const again = setInterval(run, 5 * 60_000); // sinkron ulang tiap 5 menit
    return () => clearInterval(again);
  }, []);

  // Detak jam mengikuti pergantian detik yang sebenarnya.
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const t = Date.now() + (sync?.offset ?? 0);
      const sec = Math.floor(t / 1000);
      if (sec !== last) {
        last = sec;
        setNow(new Date(t));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sync]);

  // Layar penuh: pakai Fullscreen API; kalau tidak didukung (mis. iPhone), tampilkan menutupi layar dengan CSS.
  const card = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === card.current);
    document.addEventListener("fullscreenchange", onChange);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  async function toggleFull() {
    const el = card.current;
    if (!el) return;
    if (document.fullscreenElement) return document.exitFullscreen();
    if (full) return setFull(false);
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        return;
      } catch {}
    }
    setFull(true);
  }

  const offset = sync?.offset ?? 0;
  // offset positif = server di depan = jam perangkat terlambat
  const exact = sync && Math.abs(offset) < Math.max(200, sync.accuracy);

  return (
    <div className="space-y-4">
      <div
        ref={card}
        className={`relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-center text-white ${
          full
            ? "fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
            : "rounded-[2rem] border border-slate-200/70 p-6 shadow-[0_28px_70px_rgba(11,30,61,0.45)] sm:p-10"
        }`}
      >
        <button
          type="button"
          onClick={toggleFull}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
          aria-label={full ? "Keluar dari layar penuh" : "Tampilkan jam layar penuh"}
        >
          {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {full ? "Keluar" : "Layar penuh"}
        </button>
        <p className={`font-semibold uppercase tracking-[0.3em] text-sea-300 ${full ? "text-lg sm:text-2xl" : "text-sm"}`}>Waktu Indonesia Barat</p>
        <p className={`mt-3 font-mono font-black tabular-nums tracking-tight ${full ? "text-[19vw] leading-none" : "text-6xl sm:text-8xl md:text-9xl"}`}>
          {now ? part(now, "Asia/Jakarta", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }) : "--:--:--"}
        </p>
        <p className={`mt-3 font-medium text-sea-100 ${full ? "text-2xl sm:text-4xl" : "text-base sm:text-xl"}`}>
          {now ? part(now, "Asia/Jakarta", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : " "}
        </p>
        <div className={`mx-auto mt-6 grid w-full grid-cols-3 gap-3 ${full ? "max-w-2xl" : "max-w-md"}`}>
          {ZONES.map((z) => (
            <div key={z.tz} className="rounded-2xl bg-white/10 px-2 py-2.5 shadow-inner">
              <p className="text-[11px] font-bold tracking-wider text-sea-300">{z.label}</p>
              <p className="font-mono text-lg font-bold tabular-nums">
                {now ? part(now, z.tz, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) : "--:--"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-md p-5 shadow-[0_18px_40px_rgba(15,23,42,0.18)] sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          {failed ? (
            <TriangleAlert className="mt-0.5 shrink-0 text-amber-500" />
          ) : exact ? (
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" />
          ) : (
            <TriangleAlert className="mt-0.5 shrink-0 text-rose-500" />
          )}
          <div>
            <p className="font-bold text-slate-800">
              {failed
                ? "Gagal mengecek waktu server. Jam di atas memakai jam perangkat Anda."
                : !sync
                  ? "Mengecek jam perangkat Anda..."
                  : exact
                    ? "Jam perangkat Anda tepat."
                    : `Jam perangkat Anda ${offset > 0 ? "terlambat" : "lebih cepat"} ${diffText(offset)}.`}
            </p>
            {sync && !failed && (
              <p className="text-xs text-slate-500">
                Selisih {offset > 0 ? "−" : "+"}
                {(Math.abs(offset) / 1000).toFixed(3).replace(".", ",")} detik · akurasi ±{(sync.accuracy / 1000).toFixed(3).replace(".", ",")} detik
              </p>
            )}
          </div>
        </div>
        <button
          onClick={resync}
          disabled={busy}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-sea-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-sea-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={busy ? "animate-spin" : ""} /> Cek ulang
        </button>
      </div>
    </div>
  );
}
