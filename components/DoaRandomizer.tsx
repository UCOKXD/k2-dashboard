"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Pick = { name: string; date: string };

// Riwayat disimpan per bulan: ganti bulan = otomatis mulai dari nol.
const monthKey = () => {
  const d = new Date();
  return `k2-doa-${d.getFullYear()}-${d.getMonth() + 1}`;
};

export default function DoaRandomizer({ names }: { names: string[] }) {
  const [history, setHistory] = useState<Pick[]>([]);
  const [shown, setShown] = useState("Siapa yang baca doa?");
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem(monthKey()) ?? "[]"));
    } catch {}
    return () => clearInterval(timer.current);
  }, []);

  // Yang sudah terpilih di bulan ini tidak masuk kandidat lagi (minggu depan pun).
  const pool = names.filter((n) => !history.some((h) => h.name === n));

  function spin() {
    if (spinning || !pool.length) return;
    setSpinning(true);
    const winner = pool[Math.floor(Math.random() * pool.length)];
    timer.current = setInterval(() => setShown(names[Math.floor(Math.random() * names.length)]), 70);
    setTimeout(() => {
      clearInterval(timer.current);
      setShown(winner);
      const next = [...history, { name: winner, date: new Date().toLocaleDateString("id-ID") }];
      setHistory(next);
      localStorage.setItem(monthKey(), JSON.stringify(next));
      setSpinning(false);
    }, 2500);
  }

  function reset() {
    localStorage.removeItem(monthKey());
    setHistory([]);
    setShown("Siapa yang baca doa?");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-sea-100 bg-white p-6 text-center">
        <motion.div
          animate={{ scale: spinning ? [1, 1.04, 1] : 1 }}
          transition={{ repeat: spinning ? Infinity : 0, duration: 0.3 }}
          className="grid h-32 place-items-center rounded-xl bg-navy-900 px-4 text-2xl font-extrabold text-white"
        >
          {shown}
        </motion.div>
        <button
          onClick={spin}
          disabled={spinning || !pool.length}
          className="mt-5 rounded-full bg-sea-500 px-6 py-3 font-semibold text-white transition hover:bg-sea-600 disabled:opacity-50"
        >
          {spinning ? "Mengacak..." : "Acak nama"}
        </button>
        <p className="mt-3 text-sm">
          {pool.length ? `${pool.length} nama tersisa bulan ini` : "Semua nama sudah terpilih bulan ini. Reset untuk mulai lagi."}
        </p>
      </div>

      <div className="rounded-2xl border border-sea-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Sudah dipanggil bulan ini</h3>
          <button onClick={reset} className="text-sm text-sea-600 underline">Reset</button>
        </div>
        <ol className="mt-3 space-y-1 text-sm">
          {history.map((h, i) => (
            <li key={i} className="flex justify-between border-b border-sea-100 py-1">
              <span>{h.name}</span>
              <span className="text-navy-700">{h.date}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
