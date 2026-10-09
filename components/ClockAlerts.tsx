"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, Coffee, House, UtensilsCrossed } from "lucide-react";

// Bel otomatis di halaman Waktu (Senin–Jumat, jam WIB):
// notifikasi 5, 3, 2, dan 1 menit sebelumnya → angka jam berkedip merah 10 detik terakhir →
// tepat waktunya bel berbunyi lalu stiker tampil (hanya foto, tanpa teks tambahan).
type Img = { src: string; w: number; h: number; alt: string };
type Kind = "coffee" | "food" | "home";
export type BellEvent = { id: string; at: string; label: string; kind: Kind; images: Img[] };

const COFFEE: Img = { src: "/notif/coffee-break.jpg", w: 1600, h: 1600, alt: "Sudah waktunya coffee break!" };
export const BELL_EVENTS: BellEvent[] = [
  { id: "coffee-1", at: "09:30", label: "coffee break", kind: "coffee", images: [COFFEE] },
  { id: "makan", at: "11:30", label: "makan siang", kind: "food", images: [{ src: "/notif/makan-siang.jpg", w: 1375, h: 1600, alt: "Waktunya mamam nich" }] },
  { id: "coffee-2", at: "14:30", label: "coffee break", kind: "coffee", images: [COFFEE] },
  {
    id: "pulang",
    at: "17:00",
    label: "waktunya pulang",
    kind: "home",
    images: [
      { src: "/notif/pulang.jpg", w: 1195, h: 1600, alt: "Waktunya pulang" },
      { src: "/notif/bersiaplah.jpg", w: 1600, h: 1195, alt: "Bersiaplah" },
    ],
  },
];
const DAYS = [1, 2, 3, 4, 5]; // Senin–Jumat
const WARN_MIN = [5, 3, 2, 1];
const BELL_SRC = "/sounds/bel.m4a";
const SHOW_MS = 60_000; // stiker tampil 1 menit (klik untuk menutup lebih cepat)
const ICON = { coffee: Coffee, food: UtensilsCrossed, home: House };

const secOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 3600 + m * 60;
};

// Waktu Jakarta (UTC+7, tanpa musim panas) dari milidetik.
function jkt(ms: number) {
  const s = Math.floor(ms / 1000) + 7 * 3600;
  const d = new Date(s * 1000);
  return { day: d.toISOString().slice(0, 10), weekday: d.getUTCDay(), sec: ((s % 86400) + 86400) % 86400 };
}

// Angka jam berkedip merah setiap detik pada 10 detik terakhir sebelum bel.
export function blinkAt(ms: number) {
  const { weekday, sec } = jkt(ms);
  if (!DAYS.includes(weekday)) return false;
  for (const e of BELL_EVENTS) {
    const left = secOf(e.at) - sec;
    if (left > 0 && left <= 10) return left % 2 === 0;
  }
  return false;
}

type Toast = { id: number; text: string; kind: Kind };

export function useClockAlerts() {
  const fired = useRef(new Set<string>());
  const timers = useRef<number[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const toastId = useRef(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [overlay, setOverlay] = useState<BellEvent | null>(null);
  const [needTap, setNeedTap] = useState(false);

  // Muat bel & foto lebih dulu supaya tampil tepat waktu tanpa jeda.
  useEffect(() => {
    const a = new Audio(BELL_SRC);
    a.preload = "auto";
    audio.current = a;
    for (const e of BELL_EVENTS) for (const im of e.images) new window.Image().src = im.src;
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const ring = useCallback((e: BellEvent) => {
    setToast(null);
    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setOverlay(e);
      later(() => setOverlay((cur) => (cur === e ? null : cur)), SHOW_MS);
    };
    const a = audio.current;
    if (!a) return show();
    a.currentTime = 0;
    a.onended = show; // stiker tampil setelah bel selesai berbunyi
    a.play().catch(() => {
      setNeedTap(true); // browser menahan suara sebelum halaman pernah diklik
      show();
    });
    later(show, 6000); // jaga-jaga kalau "ended" tidak terpicu
  }, []);

  // Dipanggil setiap pergantian detik (dari jam yang sudah disinkronkan dengan server).
  const check = useCallback(
    (ms: number) => {
      const { day, weekday, sec } = jkt(ms);
      const act = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
      if (act) setNeedTap(DAYS.includes(weekday) && !act.hasBeenActive); // pengingat hanya di hari kerja
      if (!DAYS.includes(weekday)) return;
      for (const e of BELL_EVENTS) {
        const left = secOf(e.at) - sec;
        for (const m of WARN_MIN) {
          const key = `${day}|${e.id}|${m}`;
          if (left <= m * 60 && left > m * 60 - 3 && !fired.current.has(key)) {
            fired.current.add(key);
            const id = ++toastId.current;
            setToast({ id, text: `${m} menit lagi ${e.label}`, kind: e.kind });
            later(() => setToast((cur) => (cur?.id === id ? null : cur)), 8000);
          }
        }
        const key = `${day}|${e.id}`;
        if (left <= 0 && left > -60 && !fired.current.has(key)) {
          fired.current.add(key);
          ring(e);
        }
      }
    },
    [ring]
  );

  return { check, toast, overlay, needTap, close: () => setOverlay(null) };
}

export function ClockAlertsLayer({ alerts, full }: { alerts: ReturnType<typeof useClockAlerts>; full: boolean }) {
  const { toast, overlay, needTap, close } = alerts;
  const Icon = toast ? ICON[toast.kind] : null;
  const two = (overlay?.images.length ?? 0) > 1;
  return (
    <>
      {needTap && (
        <p className="absolute left-4 top-4 z-30 flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold text-navy-900 shadow">
          <BellRing size={14} /> Klik layar sekali supaya bel bisa berbunyi
        </p>
      )}
      {toast && Icon && (
        <div
          key={toast.id}
          role="status"
          className={`animate-toastIn absolute inset-x-0 z-40 mx-auto flex w-fit max-w-[92%] items-center gap-2 rounded-full border border-white/25 bg-[rgba(11,30,61,0.85)] px-6 py-3 font-bold text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-md ${
            full ? "top-16 text-2xl sm:text-4xl" : "top-14 text-base sm:text-xl"
          }`}
        >
          <Icon className={full ? "h-8 w-8" : "h-5 w-5"} /> {toast.text}
        </div>
      )}
      {overlay && (
        <button
          type="button"
          onClick={close}
          aria-label="Tutup notifikasi"
          className={`absolute inset-0 z-50 flex items-center justify-center gap-4 bg-[rgba(11,30,61,0.78)] p-4 backdrop-blur-sm ${two ? "flex-col sm:flex-row" : ""}`}
        >
          {overlay.images.map((im) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={im.src}
              src={im.src}
              alt={im.alt}
              width={im.w}
              height={im.h}
              className={`animate-pop h-auto w-auto rounded-3xl object-contain shadow-[0_24px_60px_rgba(0,0,0,0.55)] ${
                two ? "max-h-[44%] max-w-[92%] sm:max-h-[88%] sm:max-w-[48%]" : "max-h-[90%] max-w-[92%]"
              }`}
            />
          ))}
        </button>
      )}
    </>
  );
}
