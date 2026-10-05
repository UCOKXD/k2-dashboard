"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { STUDENTS } from "@/lib/students";

// Grid 11 kolom sesuai denah: kiri = kolom 1-3 (2 baris), kolom 4 = lorong, kanan = kolom 5-11 (4 baris).
// Baris 1 = Papan & Dosen, baris 2-5 = kursi.
const SEATS = [
  ...Array.from({ length: 6 }, (_, i) => ({ r: 2 + Math.floor(i / 3), c: 1 + (i % 3) })),
  ...Array.from({ length: 28 }, (_, i) => ({ r: 2 + Math.floor(i / 7), c: 5 + (i % 7) })),
];

// Susunan awal = denah yang sekarang dipakai (dibaca per baris, kiri lalu kanan).
const DEFAULT = (
  "Justine Tegar Francis Yere Calvin Carol " +
  "Maria Edward Tasya Samuel Celine Michael Dea " +
  "Alex Ina Naren Sasa Aloy Tania Bryan " +
  "Davita Fahri Eve Grady Kallista Joevans William " +
  "Teguh Zaqi Adit Diipa Radin Tiop Rizky"
)
  .split(" ")
  .map((s) => STUDENTS.findIndex((x) => x.short === s));

function shuffle<T>(arr: T[]) {
  const a = [...arr]; // Fisher-Yates
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SeatPlanner() {
  const [order, setOrder] = useState(DEFAULT); // order[kursi] = indeks siswa
  const [picked, setPicked] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  function acak() {
    if (busy) return;
    setBusy(true);
    setPicked(null);
    let n = 0;
    timer.current = setInterval(() => {
      setOrder(shuffle(STUDENTS.map((_, i) => i)));
      if (++n === 6) {
        clearInterval(timer.current);
        setBusy(false);
      }
    }, 350);
  }

  function tap(seat: number) {
    if (busy) return;
    if (picked === null) return setPicked(seat);
    if (picked !== seat)
      setOrder((o) => {
        const a = [...o];
        [a[picked], a[seat]] = [a[seat], a[picked]];
        return a;
      });
    setPicked(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={acak} disabled={busy} className="rounded-full bg-sea-500 px-6 py-3 font-semibold text-white transition hover:bg-sea-600 disabled:opacity-50">
          {busy ? "Mengacak..." : "Acak Tempat Duduk"}
        </button>
        <button onClick={() => { setOrder(DEFAULT); setPicked(null); }} disabled={busy} className="rounded-full border border-sea-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-sea-100 disabled:opacity-50">
          Kembali ke denah awal
        </button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama..." className="rounded-lg border border-sea-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea-500" />
      </div>
      <p className="text-sm text-navy-700">Klik dua kursi untuk saling menukar. Arahkan kursor ke kursi untuk melihat nama lengkap.</p>

      <div className="overflow-x-auto rounded-2xl border border-sea-100 bg-white p-4">
        <div className="grid min-w-[900px] grid-cols-11 gap-2" style={{ gridTemplateRows: "auto repeat(4, 3.25rem)" }}>
          <div style={{ gridRow: 1, gridColumn: "4 / 8" }} className="rounded-lg bg-navy-900 py-2 text-center text-sm font-semibold text-white">Papan</div>
          <div style={{ gridRow: 1, gridColumn: "10 / 12" }} className="rounded-lg bg-sea-500 py-2 text-center text-sm font-semibold text-white">Dosen</div>
          <div style={{ gridRow: "4 / 6", gridColumn: "1 / 4" }} className="grid place-items-center rounded-lg border-2 border-dashed border-sea-300 text-sm text-sea-600">Box</div>

          {SEATS.map((p, i) => {
            const s = STUDENTS[order[i]];
            const hit = q !== "" && s.full.toLowerCase().includes(q.toLowerCase());
            return (
              <motion.button
                key={order[i]}
                layout
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => tap(i)}
                title={s.full}
                style={{ gridRow: p.r, gridColumn: p.c }}
                className={`rounded-lg border px-1 text-xs font-medium transition-colors ${
                  picked === i ? "border-axo-500 bg-axo-300" : hit ? "border-yellow-500 bg-yellow-200" : "border-sea-300 bg-sea-50 hover:bg-sea-100"
                }`}
              >
                {s.short}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
