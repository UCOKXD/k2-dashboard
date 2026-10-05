"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, X } from "lucide-react";
import { STUDENTS } from "@/lib/students";

// Grid 11 kolom sesuai denah: kiri = kolom 1-3 (2 baris), kolom 4 = lorong, kanan = kolom 5-11 (4 baris).
// Baris 1 = Papan & Dosen, baris 2-5 = kursi.
const SEATS = [
  ...Array.from({ length: 6 }, (_, i) => ({ r: 2 + Math.floor(i / 3), c: 1 + (i % 3) })),
  ...Array.from({ length: 28 }, (_, i) => ({ r: 2 + Math.floor(i / 7), c: 5 + (i % 7) })),
];

// Susunan awal = denah yang sekarang dipakai (dibaca per baris, kiri lalu kanan).
const DEFAULT = (
  "Justine Tegar Ancis Yere Calvin Carol " +
  "Maria Edward Tasya Samuel Celine Michael Dea " +
  "Alex Ina Naren Sasa Aloy Tania Bryan " +
  "Davita Fahri Eve Grady Kallista Joevans William " +
  "Teguh Zaqi Adit Diipa Radin Tiop Rizky"
)
  .split(" ")
  .map((s) => STUDENTS.findIndex((x) => x.short === s));

const FRONT_KEY = "k2-seat-front"; // daftar prioritas disimpan di browser ini

function shuffle<T>(arr: T[]) {
  const a = [...arr]; // Fisher-Yates
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Kursi "depan" = baris paling depan; kalau nama prioritas lebih banyak dari kursinya, baris berikutnya ikut dipakai.
function frontZone(count: number) {
  const zone = new Set<number>();
  if (!count) return zone;
  for (let row = 2; row <= 5 && zone.size < count; row++) SEATS.forEach((p, i) => p.r === row && zone.add(i));
  return zone;
}

// Pindahkan nama prioritas yang belum di zona depan ke kursi depan yang diisi nama non-prioritas.
function ensureFront(order: number[], prio: number[]) {
  const zone = frontZone(prio.length);
  const a = [...order];
  for (const st of prio) {
    const at = a.indexOf(st);
    if (zone.has(at)) continue;
    const free = [...zone].find((seat) => !prio.includes(a[seat]));
    if (free === undefined) break;
    [a[at], a[free]] = [a[free], a[at]];
  }
  return a;
}

// Acak semua kursi, tapi nama prioritas hanya diacak di antara kursi depan.
function shuffleWithFront(prio: number[]) {
  const zone = frontZone(prio.length);
  const zoneSeats = shuffle([...zone]);
  const rest = shuffle(STUDENTS.map((_, i) => i).filter((i) => !prio.includes(i)));
  const order = new Array<number>(SEATS.length);
  const pr = shuffle(prio);
  zoneSeats.forEach((seat, k) => (order[seat] = k < pr.length ? pr[k] : rest.pop()!));
  SEATS.forEach((_, seat) => {
    if (!zone.has(seat)) order[seat] = rest.pop()!;
  });
  return order;
}

export default function SeatPlanner() {
  const [order, setOrder] = useState(DEFAULT); // order[kursi] = indeks siswa
  const [prio, setPrio] = useState<number[]>([]); // indeks siswa yang wajib duduk depan
  const [picked, setPicked] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [pq, setPq] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    let saved: number[] = [];
    try {
      saved = (JSON.parse(localStorage.getItem(FRONT_KEY) ?? "[]") as number[]).filter((i) => STUDENTS[i]);
    } catch {}
    const id = setTimeout(() => {
      if (saved.length) {
        setPrio(saved);
        setOrder((o) => ensureFront(o, saved));
      }
    });
    return () => {
      clearTimeout(id);
      clearInterval(timer.current);
    };
  }, []);

  const zone = frontZone(prio.length);

  function savePrio(next: number[]) {
    setPrio(next);
    setOrder((o) => ensureFront(o, next));
    try {
      localStorage.setItem(FRONT_KEY, JSON.stringify(next));
    } catch {}
  }

  function togglePrio(st: number) {
    setMsg("");
    savePrio(prio.includes(st) ? prio.filter((x) => x !== st) : [...prio, st]);
  }

  function acak() {
    if (busy) return;
    setBusy(true);
    setPicked(null);
    setMsg("");
    let n = 0;
    timer.current = setInterval(() => {
      setOrder(shuffleWithFront(prio));
      if (++n === 6) {
        clearInterval(timer.current);
        setBusy(false);
      }
    }, 350);
  }

  function tap(seat: number) {
    if (busy) return;
    setMsg("");
    if (picked === null) return setPicked(seat);
    if (picked !== seat) {
      // Nama prioritas tidak boleh pindah ke luar kursi depan.
      const a = order[picked];
      const b = order[seat];
      if ((prio.includes(a) && !zone.has(seat)) || (prio.includes(b) && !zone.has(picked))) {
        setMsg(`${STUDENTS[prio.includes(a) && !zone.has(seat) ? a : b].short} wajib duduk paling depan. Lepas dulu dari daftar prioritas kalau ingin dipindah.`);
        setPicked(null);
        return;
      }
      setOrder((o) => {
        const x = [...o];
        [x[picked], x[seat]] = [x[seat], x[picked]];
        return x;
      });
    }
    setPicked(null);
  }

  const zoneLabel = zone.size > 10 ? `${zone.size} kursi terdepan` : "baris paling depan (10 kursi)";
  const candidates = STUDENTS.map((s, i) => ({ ...s, i })).filter(
    (s) => !pq || s.full.toLowerCase().includes(pq.toLowerCase()) || s.short.toLowerCase().includes(pq.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={acak} disabled={busy} className="rounded-full bg-sea-500 px-6 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(31,125,186,0.45)] transition hover:bg-sea-600 disabled:opacity-50">
          {busy ? "Mengacak..." : "Acak Tempat Duduk"}
        </button>
        <button
          onClick={() => {
            setOrder(ensureFront(DEFAULT, prio));
            setPicked(null);
            setMsg("");
          }}
          disabled={busy}
          className="rounded-full border border-sea-300 bg-white px-5 py-3 text-sm font-medium shadow-sm transition hover:bg-sea-100 disabled:opacity-50"
        >
          Kembali ke denah awal
        </button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama..." className="rounded-lg border border-sea-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea-500" />
      </div>
      <p className="text-sm text-navy-700">Klik dua kursi untuk saling menukar. Arahkan kursor ke kursi untuk melihat nama lengkap.</p>
      {msg && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{msg}</p>}

      <div className="overflow-x-auto rounded-2xl border border-sea-100 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.2)]">
        <div className="grid min-w-[900px] grid-cols-11 gap-2" style={{ gridTemplateRows: "auto repeat(4, 3.25rem)" }}>
          <div style={{ gridRow: 1, gridColumn: "4 / 8" }} className="rounded-lg bg-navy-900 py-2 text-center text-sm font-semibold text-white">Papan</div>
          <div style={{ gridRow: 1, gridColumn: "10 / 12" }} className="rounded-lg bg-sea-500 py-2 text-center text-sm font-semibold text-white">Dosen</div>
          <div style={{ gridRow: "4 / 6", gridColumn: "1 / 4" }} className="grid place-items-center rounded-lg border-2 border-dashed border-sea-300 text-sm text-sea-600">Box</div>

          {SEATS.map((p, i) => {
            const s = STUDENTS[order[i]];
            const hit = q !== "" && s.full.toLowerCase().includes(q.toLowerCase());
            const isPrio = prio.includes(order[i]);
            return (
              <motion.button
                key={order[i]}
                layout
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => tap(i)}
                title={isPrio ? `${s.full} (wajib depan)` : s.full}
                style={{ gridRow: p.r, gridColumn: p.c }}
                className={`relative rounded-lg border px-1 text-xs font-medium shadow-[0_4px_10px_rgba(15,23,42,0.12)] transition-colors ${
                  picked === i
                    ? "border-axo-500 bg-axo-300"
                    : hit
                      ? "border-yellow-500 bg-yellow-200"
                      : isPrio
                        ? "border-amber-400 bg-amber-50 hover:bg-amber-100"
                        : zone.has(i)
                          ? "border-sea-300 bg-sea-100/70 hover:bg-sea-100"
                          : "border-sea-300 bg-sea-50 hover:bg-sea-100"
                }`}
              >
                {isPrio && <Star size={10} className="absolute right-1 top-1 fill-amber-400 text-amber-500" />}
                {s.short}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Prioritas duduk depan */}
      <div className="space-y-3 rounded-2xl border border-sea-100 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.2)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-1.5 font-bold text-navy-900">
              <Star size={16} className="fill-amber-400 text-amber-500" /> Prioritas Duduk Depan
            </h3>
            <p className="text-sm text-navy-700">
              Pilih nama yang wajib duduk paling depan. Saat diacak, mereka tetap di {zoneLabel}; sisanya diacak atau dipindah manual seperti biasa.
            </p>
          </div>
          {prio.length > 0 && (
            <button onClick={() => savePrio([])} className="text-sm text-sea-600 underline">
              Hapus semua
            </button>
          )}
        </div>

        {prio.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prio.map((st) => (
              <button key={st} onClick={() => togglePrio(st)} className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-200">
                {STUDENTS[st].full} <X size={12} />
              </button>
            ))}
          </div>
        )}

        <input value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Cari nama untuk ditambahkan..." className="w-full max-w-xs rounded-lg border border-sea-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea-500" />
        <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto">
          {candidates.map((s) => {
            const on = prio.includes(s.i);
            return (
              <button
                key={s.i}
                onClick={() => togglePrio(s.i)}
                disabled={busy}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${on ? "border-amber-400 bg-amber-400 text-white shadow" : "border-sea-300 bg-sea-50 text-navy-900 hover:bg-sea-100"}`}
              >
                {s.absen}. {s.full}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
