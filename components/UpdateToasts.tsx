"use client";
import { useEffect, useRef, useState } from "react";
import { BellRing, X } from "lucide-react";
import type { LogItem } from "@/lib/dashboard";

const SEEN = "k2-seen-logs"; // id log yang sudah pernah dilihat di browser ini
const SHOW_MS = 5000; // tampil 5 detik, lalu memudar
const POLL_MS = 30_000;

function readSeen(): string[] | null {
  try {
    const raw = localStorage.getItem(SEEN);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}
function writeSeen(ids: string[]) {
  try {
    localStorage.setItem(SEEN, JSON.stringify(ids.slice(-300)));
  } catch {}
}

type Toast = LogItem & { leaving: boolean };

// Notifikasi kecil di kiri bawah setiap ada pembaruan baru di Log Aktivitas.
// Kunjungan pertama tidak memunculkan apa-apa; setelah itu hanya yang benar-benar baru.
export default function UpdateToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const r = await fetch("/api/logs");
        const { logs } = (await r.json()) as { logs: LogItem[] };
        if (!alive || !logs?.length) return;
        const seen = readSeen();
        writeSeen([...(seen ?? []), ...logs.map((l) => l.id).filter((id) => !seen?.includes(id))]);
        if (!seen) return; // kunjungan pertama: tandai semua sudah dilihat
        const fresh = logs.filter((l) => !seen.includes(l.id)).slice(0, 3);
        fresh.forEach((l, i) => {
          const showAt = i * 600;
          timers.current.push(
            setTimeout(() => setToasts((t) => [...t.filter((x) => x.id !== l.id), { ...l, leaving: false }]), showAt),
            setTimeout(() => setToasts((t) => t.map((x) => (x.id === l.id ? { ...x, leaving: true } : x))), showAt + SHOW_MS),
            setTimeout(() => setToasts((t) => t.filter((x) => x.id !== l.id)), showAt + SHOW_MS + 700)
          );
        });
      } catch {}
    };
    const first = setTimeout(check, 1500);
    const id = setInterval(check, POLL_MS);
    const list = timers.current;
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(id);
      list.forEach(clearTimeout);
    };
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[90] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex gap-3 rounded-2xl border border-white/30 bg-navy-900/70 p-3.5 text-white shadow-[0_18px_44px_rgba(11,30,61,0.45)] backdrop-blur-md transition-all duration-700 ${
            t.leaving ? "translate-y-2 opacity-0" : "animate-toastIn opacity-100"
          }`}
        >
          <div className="h-fit rounded-xl bg-white/15 p-2">
            <BellRing size={16} className="text-sea-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sea-300">Update baru</p>
            <p className="text-sm font-bold leading-snug">{t.title}</p>
            <p className="line-clamp-2 text-xs text-white/80">{t.detail}</p>
          </div>
          <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="h-fit text-white/60 hover:text-white" aria-label="Tutup notifikasi">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
