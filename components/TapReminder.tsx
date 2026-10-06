"use client";
import { useState } from "react";
import { CreditCard } from "lucide-react";

// Pengingat tap in / tap out: kartu merah transparan yang timbul saat disorot dan berdenyut saat diklik.
export default function TapReminder() {
  const [pulse, setPulse] = useState(0);
  return (
    <div
      onClick={() => setPulse((n) => n + 1)}
      className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-3xl border border-red-300/70 bg-red-500/10 px-5 py-4 shadow-[0_14px_34px_rgba(220,38,38,0.18)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(220,38,38,0.28)] sm:px-7"
    >
      <span key={pulse} className={`pointer-events-none absolute inset-0 rounded-3xl ${pulse ? "animate-ping-once bg-red-400/20" : ""}`} />
      <span key={`i${pulse}`} className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-500/15 text-red-600 shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 ${pulse ? "animate-wiggle" : ""}`}>
        <CreditCard size={24} />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-black tracking-wide text-red-600 sm:text-xl">JANGAN LUPA TAP IN &amp; TAP OUT!</p>
        <p className="text-sm text-red-700/80">Tap kartu saat masuk dan saat pulang supaya kehadiranmu tercatat.</p>
      </div>
    </div>
  );
}
