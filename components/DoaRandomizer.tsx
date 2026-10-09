"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Plus } from "lucide-react";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import { LOCAL_DOA_LOG } from "@/lib/dashboard";
import { STUDENTS } from "@/lib/students";
import type { DoaPick } from "@/lib/store";

// Riwayat lokal per bulan (dipakai selama penyimpanan server belum dipasang): ganti bulan = mulai dari nol.
const monthKey = () => {
  const d = new Date();
  return `k2-doa-${d.getFullYear()}-${d.getMonth() + 1}`;
};

const nimOf = (name: string) => STUDENTS.find((s) => s.full === name)?.nim ?? "-";
const todayJkt = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
const fmtLong = (ymd: string) => new Date(`${ymd}T12:00:00+07:00`).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" });
const fmt = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });

function readLocal<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

// Riwayat lokal versi lama berbentuk { name, date: "6/10/2026" }; ubah ke bentuk baru.
function localHistory(): DoaPick[] {
  return readLocal<DoaPick & { date?: string }>(monthKey()).map((p) => {
    if (p.at) return p;
    const [d, m, y] = (p.date ?? "").split(/\D+/).map(Number);
    const at = d && m && y ? new Date(Date.UTC(y, m - 1, d, 5)).toISOString() : new Date().toISOString();
    return { name: p.name, nim: nimOf(p.name), at };
  });
}

// Semua orang bisa melihat riwayat; hanya admin yang sudah masuk yang bisa mengacak.
export default function DoaRandomizer({ names }: { names: string[] }) {
  const { user } = useAuth();
  const [history, setHistory] = useState<DoaPick[]>([]);
  const [stored, setStored] = useState(true); // true = riwayat tersimpan di server (terlihat semua orang)
  const [error, setError] = useState("");
  const [shown, setShown] = useState("Siapa yang baca doa?");
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [manualName, setManualName] = useState("");
  const [manualDate, setManualDate] = useState(todayJkt);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/doa")
      .then((r) => r.json())
      .then((d: { stored?: boolean; picks?: DoaPick[] }) => {
        setStored(!!d.stored);
        setHistory(d.stored ? (d.picks ?? []) : localHistory());
      })
      .catch(() => setHistory(localHistory()));
    return () => clearInterval(timer.current);
  }, []);

  // Yang sudah terpilih di bulan ini tidak masuk kandidat lagi.
  const pool = names.filter((n) => !history.some((h) => h.name === n));

  async function spin() {
    if (spinning || !pool.length || !user) return;
    setError("");
    setSpinning(true);
    const winner = pool[Math.floor(Math.random() * pool.length)];
    timer.current = setInterval(() => setShown(names[Math.floor(Math.random() * names.length)]), 70);

    // Catat dulu di server; animasi tetap jalan minimal 2,5 detik.
    const [res] = await Promise.allSettled([
      adminFetch<{ stored: boolean; pick: DoaPick }>("/api/doa", "POST", { name: winner }),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    clearInterval(timer.current);
    setSpinning(false);

    if (res.status === "rejected") {
      setShown("Siapa yang baca doa?");
      setError((res.reason as Error).message);
      return;
    }
    const pick = res.value.pick;
    setShown(winner);
    const next = [...history, pick];
    setHistory(next);
    if (!res.value.stored) {
      localStorage.setItem(monthKey(), JSON.stringify(next));
      localStorage.setItem(LOCAL_DOA_LOG, JSON.stringify([...readLocal<DoaPick>(LOCAL_DOA_LOG), pick].slice(-60)));
    }
  }

  // Admin menandai nama yang sudah berdoa bulan ini di luar acak (mis. sebelum website dipakai).
  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !manualName) return;
    setError("");
    setAdding(true);
    try {
      const res = await adminFetch<{ stored: boolean; pick: DoaPick }>("/api/doa", "POST", { name: manualName, manual: true, date: manualDate });
      const next = [...history, res.pick];
      setHistory(next);
      setManualName("");
      if (!res.stored) localStorage.setItem(monthKey(), JSON.stringify(next));
    } catch (err) {
      setError((err as Error).message);
    }
    setAdding(false);
  }

  async function reset() {
    if (!user || !confirm("Reset riwayat doa bulan ini?")) return;
    try {
      await adminFetch("/api/doa", "DELETE");
      localStorage.removeItem(monthKey());
      setHistory([]);
      setShown("Siapa yang baca doa?");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-center shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-md">
        <motion.div
          animate={{ scale: spinning ? [1, 1.04, 1] : 1 }}
          transition={{ repeat: spinning ? Infinity : 0, duration: 0.3 }}
          className="grid h-32 place-items-center rounded-xl bg-navy-900 px-4 text-2xl font-extrabold text-white shadow-[0_12px_28px_rgba(11,30,61,0.45)]"
        >
          {shown}
        </motion.div>

        {user ? (
          <>
            <button
              onClick={spin}
              disabled={spinning || !pool.length}
              className="mt-5 rounded-full bg-sea-500 px-6 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(31,125,186,0.45)] transition hover:bg-sea-600 disabled:opacity-50"
            >
              {spinning ? "Mengacak..." : "Acak nama"}
            </button>
            <p className="mt-3 text-sm">
              {pool.length ? `${pool.length} nama tersisa bulan ini` : "Semua nama sudah terpilih bulan ini. Reset untuk mulai lagi."}
            </p>
          </>
        ) : (
          <p className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-1.5 text-sm text-navy-700">
            <Lock size={14} /> Pengacakan dilakukan oleh admin.{" "}
            <Link href="/masuk" className="font-semibold text-sea-600 underline">
              Masuk
            </Link>
          </p>
        )}
        {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
        {user && !stored && <p className="mt-3 text-xs text-navy-700/80">Riwayat & log saat ini hanya tersimpan di perangkat ini (penyimpanan server belum dipasang).</p>}
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Sudah dipanggil bulan ini</h3>
          {user && (
            <button onClick={reset} className="text-sm text-sea-600 underline">
              Reset
            </button>
          )}
        </div>
        {user && (
          <form onSubmit={addManual} className="mt-4 space-y-2 rounded-xl border border-sea-100 bg-sea-50/60 p-3">
            <p className="text-xs font-semibold text-navy-700">Tambah manual: nama yang sudah berdoa bulan ini di luar acak</p>
            <div className="flex flex-wrap gap-2">
              <select
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                aria-label="Nama yang sudah berdoa"
                className="min-w-0 flex-[1_1_12rem] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sea-500"
              >
                <option value="">— pilih nama —</option>
                {pool.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <select
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                aria-label="Tanggal berdoa"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sea-500"
              >
                {Array.from({ length: Number(todayJkt().slice(8)) }, (_, i) => {
                  const d = `${todayJkt().slice(0, 7)}-${String(i + 1).padStart(2, "0")}`;
                  return (
                    <option key={d} value={d}>
                      {fmtLong(d)}
                    </option>
                  );
                }).reverse()}
              </select>
              <button
                disabled={!manualName || adding}
                className="flex items-center gap-1 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-40"
              >
                <Plus size={14} /> {adding ? "Menyimpan..." : "Tambah"}
              </button>
            </div>
          </form>
        )}
        {history.length === 0 && <p className="mt-3 text-sm text-navy-700/70">Belum ada.</p>}
        <ol className="mt-3 space-y-1 text-sm">
          {history.map((h, i) => (
            <li key={i} className="flex justify-between gap-3 border-b border-sea-100 py-1">
              <span>
                {h.name} <span className="text-xs text-navy-700/70">({h.nim})</span>
                {h.manual && <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">manual</span>}
              </span>
              <span className="shrink-0 text-navy-700">{fmt(h.at)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
