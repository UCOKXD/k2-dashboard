"use client";
import { Pause, Play } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

// Tombol jeda untuk animasi hiasan yang berjalan terus (axolotl berenang, gelembung, konfeti, stiker terbang).
// Pilihan disimpan di browser dan berlaku di semua halaman lewat kelas "k2-still" di <html> (lihat globals.css).
const KEY = "k2-still";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

export default function MotionToggle({ className = "", tone = "light", compact = false }: { className?: string; tone?: "light" | "dark"; compact?: boolean }) {
  const still = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains(KEY), () => false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "1") document.documentElement.classList.add(KEY);
    } catch {}
  }, []);

  function toggle() {
    const next = !still;
    document.documentElement.classList.toggle(KEY, next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {}
  }

  const look =
    tone === "dark"
      ? "border-white/40 bg-[rgba(6,18,39,0.55)] text-white hover:bg-[rgba(6,18,39,0.75)]"
      : "border-line-strong bg-surface text-ink-2 hover:border-ink-3";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={still}
      aria-label={compact ? (still ? "Putar animasi" : "Jeda animasi") : undefined}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-k2-md border px-3 text-xs font-semibold transition ${look} ${className}`}
    >
      {still ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      <span className={compact ? "hidden sm:inline" : ""}>{still ? "Putar animasi" : "Jeda animasi"}</span>
    </button>
  );
}
