"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lock, LogOut } from "lucide-react";
import { LOCAL_DOA_LOG } from "@/lib/dashboard";
import { STUDENTS } from "@/lib/students";
import type { DoaPick } from "@/lib/store";

// Riwayat lokal per bulan (dipakai selama penyimpanan server belum dipasang): ganti bulan = mulai dari nol.
const monthKey = () => {
  const d = new Date();
  return `k2-doa-${d.getFullYear()}-${d.getMonth() + 1}`;
};
const PIN_KEY = "k2-admin-pin"; // hanya sessionStorage: hilang saat tab ditutup

const nimOf = (name: string) => STUDENTS.find((s) => s.full === name)?.nim ?? "-";
const fmt = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });

function readLocal<T>(key: string, store: Storage = localStorage): T[] {
  try {
    return JSON.parse(store.getItem(key) ?? "[]") as T[];
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

async function call(method: "POST" | "DELETE", body: object) {
  const res = await fetch("/api/doa", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { error?: string; stored?: boolean };
  if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan");
  return data;
}

export default function DoaRandomizer({ names }: { names: string[] }) {
  const [history, setHistory] = useState<DoaPick[]>([]);
  const [stored, setStored] = useState(false); // true = riwayat tersimpan di server (terlihat semua orang)
  const [pin, setPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [shown, setShown] = useState("Siapa yang baca doa?");
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    fetch("/api/doa")
      .then((r) => r.json())
      .then((d: { stored?: boolean; picks?: DoaPick[] }) => {
        try {
          setPin(sessionStorage.getItem(PIN_KEY) ?? "");
        } catch {}
        if (d.stored) {
          setStored(true);
          setHistory(d.picks ?? []);
        } else setHistory(localHistory());
      })
      .catch(() => setHistory(localHistory()));
    return () => clearInterval(timer.current);
  }, []);

  // Yang sudah terpilih di bulan ini tidak masuk kandidat lagi.
  const pool = names.filter((n) => !history.some((h) => h.name === n));

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await call("POST", { pin: pinInput });
      sessionStorage.setItem(PIN_KEY, pinInput);
      setPin(pinInput);
      setPinInput("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function logout() {
    sessionStorage.removeItem(PIN_KEY);
    setPin("");
  }

  async function spin() {
    if (spinning || !pool.length || !pin) return;
    setError("");
    setSpinning(true);
    const winner = pool[Math.floor(Math.random() * pool.length)];
    timer.current = setInterval(() => setShown(names[Math.floor(Math.random() * names.length)]), 70);

    // Catat dulu di server (sekaligus cek PIN); animasi tetap jalan minimal 2,5 detik.
    const [res] = await Promise.allSettled([
      call("POST", { pin, name: winner }),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    clearInterval(timer.current);
    setSpinning(false);

    if (res.status === "rejected") {
      setShown("Siapa yang baca doa?");
      setError((res.reason as Error).message);
      if ((res.reason as Error).message === "PIN salah") logout();
      return;
    }
    const pick: DoaPick = { name: winner, nim: nimOf(winner), at: new Date().toISOString() };
    setShown(winner);
    const next = [...history, pick];
    setHistory(next);
    if (!res.value.stored) {
      localStorage.setItem(monthKey(), JSON.stringify(next));
      localStorage.setItem(LOCAL_DOA_LOG, JSON.stringify([...readLocal<DoaPick>(LOCAL_DOA_LOG), pick].slice(-60)));
    }
  }

  async function reset() {
    if (!pin || !confirm("Reset riwayat doa bulan ini?")) return;
    try {
      await call("DELETE", { pin });
      localStorage.removeItem(monthKey());
      setHistory([]);
      setShown("Siapa yang baca doa?");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-sea-100 bg-white p-6 text-center shadow-[0_20px_45px_rgba(15,23,42,0.2)]">
        <motion.div
          animate={{ scale: spinning ? [1, 1.04, 1] : 1 }}
          transition={{ repeat: spinning ? Infinity : 0, duration: 0.3 }}
          className="grid h-32 place-items-center rounded-xl bg-navy-900 px-4 text-2xl font-extrabold text-white shadow-[0_12px_28px_rgba(11,30,61,0.45)]"
        >
          {shown}
        </motion.div>

        {pin ? (
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
            <button onClick={logout} className="mx-auto mt-2 flex items-center gap-1 text-xs text-navy-700 underline">
              <LogOut size={12} /> Keluar mode admin
            </button>
          </>
        ) : (
          <form onSubmit={login} className="mx-auto mt-5 flex max-w-xs flex-col gap-2">
            <label className="flex items-center justify-center gap-1.5 text-sm font-semibold text-navy-900">
              <Lock size={14} /> Masukkan PIN admin untuk mengacak
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN"
                className="min-w-0 flex-1 rounded-lg border border-sea-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea-500"
              />
              <button disabled={!pinInput} className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                Buka
              </button>
            </div>
          </form>
        )}
        {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
        {!stored && <p className="mt-3 text-xs text-navy-700/80">Riwayat & log saat ini hanya tersimpan di perangkat ini.</p>}
      </div>

      <div className="rounded-2xl border border-sea-100 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.2)]">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Sudah dipanggil bulan ini</h3>
          {pin && (
            <button onClick={reset} className="text-sm text-sea-600 underline">
              Reset
            </button>
          )}
        </div>
        <ol className="mt-3 space-y-1 text-sm">
          {history.map((h, i) => (
            <li key={i} className="flex justify-between gap-3 border-b border-sea-100 py-1">
              <span>
                {h.name} <span className="text-xs text-navy-700/70">({h.nim})</span>
              </span>
              <span className="shrink-0 text-navy-700">{fmt(h.at)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
