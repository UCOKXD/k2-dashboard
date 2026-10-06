"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Save, Star, Undo2, X } from "lucide-react";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import type { SeatsData } from "@/lib/content";
import { DEFAULT_ORDER, SEATS, ensureFront, frontRows, shuffleWithFront, valid } from "@/lib/seats";
import { STUDENTS } from "@/lib/students";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hourCycle: "h23", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Denah yang dipublikasikan admin terlihat semua orang. Hanya admin yang bisa mengacak, menukar, dan mengatur prioritas.
export default function SeatPlanner({ initial }: { initial: SeatsData }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initial); // versi yang sudah dipublikasikan
  const [order, setOrder] = useState(initial?.order ?? DEFAULT_ORDER); // order[kursi] = indeks siswa
  const [prio, setPrio] = useState<number[]>(initial?.prio ?? []); // indeks siswa yang wajib duduk depan
  const [picked, setPicked] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [pq, setPq] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shuffled, setShuffled] = useState(false); // untuk Log Aktivitas: "mengacak" vs "memindahkan kursi"
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  const admin = !!user;
  const base = saved ?? { order: DEFAULT_ORDER, prio: [] as number[] };
  const dirty = order.join() !== base.order.join() || [...prio].sort().join() !== [...base.prio].sort().join();
  const { zone, full } = frontRows(prio.length);

  function togglePrio(st: number) {
    setMsg("");
    const next = prio.includes(st) ? prio.filter((x) => x !== st) : [...prio, st];
    setPrio(next);
    setOrder((o) => ensureFront(o, next));
  }

  function acak() {
    if (busy) return;
    setBusy(true);
    setShuffled(true);
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
    if (busy || !admin) return;
    setMsg("");
    if (picked === null) return setPicked(seat);
    if (picked !== seat) {
      const next = [...order];
      [next[picked], next[seat]] = [next[seat], next[picked]];
      if (!valid(next, prio)) {
        const who = [order[picked], order[seat]].find((st) => prio.includes(st));
        setMsg(
          who !== undefined
            ? `${STUDENTS[who].short} wajib duduk paling depan. Lepas dulu dari daftar prioritas kalau ingin dipindah.`
            : "Baris paling depan khusus untuk nama prioritas."
        );
        setPicked(null);
        return;
      }
      setOrder(next);
    }
    setPicked(null);
  }

  async function save() {
    setSaving(true);
    setMsg("");
    setOk("");
    try {
      const r = await adminFetch<{ data: SeatsData }>("/api/content/seats", "PUT", { order, prio, acak: shuffled });
      setSaved(r.data);
      setShuffled(false);
      setOk("Tempat duduk disimpan dan diumumkan di Log Aktivitas.");
    } catch (e) {
      setMsg((e as Error).message);
    }
    setSaving(false);
  }

  function discard() {
    setOrder(base.order);
    setPrio(base.prio);
    setShuffled(false);
    setPicked(null);
    setMsg("");
  }

  const zoneLabel =
    prio.length > 10 ? `baris paling depan (penuh 10 kursi), sisanya ${prio.length - full.size} di baris berikutnya` : "baris paling depan (10 kursi)";
  const candidates = STUDENTS.map((s, i) => ({ ...s, i })).filter(
    (s) => !pq || s.full.toLowerCase().includes(pq.toLowerCase()) || s.short.toLowerCase().includes(pq.toLowerCase())
  );
  const btn = "rounded-full px-5 py-3 text-sm font-semibold shadow-[0_10px_24px_rgba(15,23,42,0.2)] transition disabled:opacity-50";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {admin && (
          <>
            <button onClick={acak} disabled={busy} className={`${btn} bg-sea-500 px-6 text-base text-white hover:bg-sea-600`}>
              {busy ? "Mengacak..." : "Acak Tempat Duduk"}
            </button>
            <button
              onClick={() => {
                setOrder(ensureFront(DEFAULT_ORDER, prio));
                setPicked(null);
                setMsg("");
              }}
              disabled={busy}
              className={`${btn} border border-sea-300 bg-white/80 hover:bg-sea-100`}
            >
              Kembali ke denah awal
            </button>
          </>
        )}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama..." className="rounded-lg border border-sea-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea-500" />
      </div>

      {admin ? (
        <p className="text-sm text-navy-700">Klik dua kursi untuk saling menukar. Perubahan baru terlihat semua orang setelah Anda menekan Simpan.</p>
      ) : (
        <p className="flex items-center gap-1.5 text-sm text-navy-700">
          <Lock size={14} /> Denah resmi dari admin{saved?.at ? `, diperbarui ${fmt(saved.at)}${saved.by ? ` oleh ${saved.by}` : ""}` : ""}. Arahkan kursor ke kursi untuk melihat nama lengkap.
        </p>
      )}

      {admin && dirty && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.15)]">
          <p className="text-sm font-semibold text-amber-900">Ada perubahan yang belum disimpan.</p>
          <div className="flex gap-2">
            <button onClick={discard} className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900">
              <Undo2 size={14} /> Batalkan
            </button>
            <button onClick={save} disabled={saving || busy} className="flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50">
              <Save size={14} /> {saving ? "Menyimpan..." : "Simpan & umumkan"}
            </button>
          </div>
        </div>
      )}
      {msg && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{msg}</p>}
      {ok && !dirty && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{ok}</p>}

      <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-md">
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
                whileTap={admin ? { scale: 0.95 } : undefined}
                onClick={() => tap(i)}
                title={isPrio ? `${s.full} (wajib depan)` : s.full}
                style={{ gridRow: p.r, gridColumn: p.c }}
                className={`relative rounded-lg border px-1 text-xs font-medium shadow-[0_4px_10px_rgba(15,23,42,0.12)] transition-colors ${admin ? "" : "cursor-default"} ${
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

      {/* Prioritas duduk depan (admin) */}
      {admin && (
        <div className="space-y-3 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-1.5 font-bold text-navy-900">
                <Star size={16} className="fill-amber-400 text-amber-500" /> Prioritas Duduk Depan
              </h3>
              <p className="text-sm text-navy-700">
                Pilih nama yang wajib duduk paling depan. Saat diacak, mereka tetap di {zoneLabel}. Nama lain bisa diacak atau dipindah manual seperti biasa.
              </p>
            </div>
            {prio.length > 0 && (
              <button
                onClick={() => {
                  setPrio([]);
                  setMsg("");
                }}
                className="text-sm text-sea-600 underline"
              >
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
      )}
    </div>
  );
}
