"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import Sticker from "@/components/Sticker";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import { joinNames } from "@/components/Birthday";
import type { BdayInfo, BdayPerson, Wish } from "@/lib/birthday";
import { STUDENTS } from "@/lib/students";

const WISH_MAX = 200;
const COLORS = ["#f8c3cf", "#fbbf24", "#8fcff1", "#ffffff", "#f08ca3"];

// Konfeti jatuh: posisi & waktu tetap (bukan acak) supaya tampilan server dan browser sama.
const FALLING = [
  { left: "6%", dur: 6.5, delay: -1 },
  { left: "15%", dur: 8, delay: -4.5 },
  { left: "26%", dur: 5.5, delay: -2.2 },
  { left: "37%", dur: 7.5, delay: -6 },
  { left: "48%", dur: 6, delay: -0.5 },
  { left: "58%", dur: 8.5, delay: -3.4 },
  { left: "67%", dur: 5.8, delay: -5.1 },
  { left: "76%", dur: 7.2, delay: -1.7 },
  { left: "86%", dur: 6.8, delay: -4 },
  { left: "94%", dur: 8.2, delay: -2.8 },
];

const initials = (nama: string) =>
  nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// Lingkaran inisial. Nanti kalau foto siswa sudah ada, cukup isi `photo`.
function Avatar({ nama, photo }: { nama: string; photo?: string }) {
  return (
    <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white/70 bg-gradient-to-br from-axo-500 to-sea-500 text-lg font-black text-white shadow-[0_8px_20px_rgba(11,30,61,0.35)] sm:h-[72px] sm:w-[72px] sm:text-2xl">
      {photo ? <Image src={photo} alt="" fill sizes="72px" className="object-cover" /> : initials(nama)}
    </span>
  );
}

type Piece = { id: number; x: number; y: number; dx: number; dy: number; rot: number; color: string };

// Banner pengganti foto beranda, hanya pada hari ada yang ulang tahun.
export function BirthdayHero({ people }: { people: BdayPerson[] }) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  // Klik di mana saja pada banner: 18 kepingan menyebar dari titik klik lalu memudar.
  const burst = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const batch: Piece[] = Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 70 + Math.random() * 90;
      return {
        id: nextId.current++,
        x,
        y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        rot: Math.round(Math.random() * 540 - 270),
        color: COLORS[i % COLORS.length],
      };
    });
    const ids = new Set(batch.map((p) => p.id));
    setPieces((prev) => [...prev, ...batch].slice(-90)); // maksimal ~90 kepingan
    const t = setTimeout(() => {
      setPieces((prev) => prev.filter((p) => !ids.has(p.id)));
      timers.current = timers.current.filter((x) => x !== t);
    }, 1200);
    timers.current.push(t);
  }, []);

  return (
    // Jarak atas mengikuti tinggi bunting (sebanding lebar layar) supaya bunting tidak menutupi tulisan.
    <div className="mx-auto max-w-[1000px] px-4 md:px-0" style={{ paddingTop: "calc(2.5rem + 10vw)" }}>
      <section
        aria-label="Ucapan ulang tahun"
        onClick={burst}
        className="relative flex min-h-[560px] flex-col items-center overflow-hidden rounded-[2.5rem] border-4 border-white px-5 pb-12 pt-10 text-center text-white shadow-[0_30px_70px_rgba(11,30,61,0.45)] sm:min-h-[620px] sm:px-10"
        style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #1B3A6B 55%, #b4577a 100%)" }}
      >
        {/* Dekorasi (tidak bisa diklik, tidak dibacakan) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {FALLING.map((c, i) => (
            <span key={i} className="k2-confetti" style={{ left: c.left, background: COLORS[i % COLORS.length], animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }} />
          ))}
          <Image src="/perayaan/balon-biru-perak.png" alt="" width={284} height={392} className="k2-bd-sway absolute left-3 top-4 h-auto w-[64px] opacity-90 sm:left-8 sm:w-[110px]" />
          <Image src="/perayaan/balon-hati-merah.png" alt="" width={179} height={430} className="k2-bd-sway absolute right-3 top-4 h-auto w-[44px] opacity-90 [animation-delay:-2.5s] sm:right-10 sm:w-[72px]" />
          <Image src="/perayaan/terompet-konfeti.png" alt="" width={270} height={520} className="absolute -bottom-2 left-2 h-auto w-[48px] -scale-x-100 sm:left-6 sm:w-[84px]" />
          <Image src="/perayaan/terompet-konfeti.png" alt="" width={270} height={520} className="absolute -bottom-2 right-2 h-auto w-[48px] sm:right-6 sm:w-[84px]" />
        </div>

        <div className="relative z-10 flex w-full flex-col items-center">
          <Image
            src="/perayaan/happy-birthday.png"
            alt="Happy Birthday"
            width={588}
            height={213}
            priority
            className="h-auto w-[420px] max-w-[72%] drop-shadow-[0_8px_20px_rgba(11,30,61,0.5)]"
          />

          {/* Kartu nama berdampingan (tidak ditumpuk), sama besar: 1, 2, atau 3 orang tetap sejajar.
              Di ponsel kartunya dibuat tegak (inisial di atas nama) supaya tetap muat berdampingan. */}
          <div className={`mt-6 flex w-full justify-center gap-2 sm:flex-wrap sm:gap-4 ${people.length > 3 ? "flex-wrap" : ""}`}>
            {people.map((p) => (
              <div
                key={p.nama}
                className={`flex min-w-0 flex-1 flex-col items-center gap-2 rounded-3xl border border-white/25 bg-white/10 p-3 text-center backdrop-blur-md sm:flex-row sm:gap-4 sm:p-4 sm:text-left ${
                  people.length > 3 ? "min-w-[40%] sm:min-w-0" : ""
                } ${people.length >= 3 ? "sm:flex-[0_1_280px]" : "max-w-[340px] sm:flex-[0_1_340px]"}`}
              >
                <Avatar nama={p.nama} />
                <div className="min-w-0">
                  <p
                    className={`break-words font-extrabold leading-tight ${people.length >= 3 ? "text-sm sm:text-2xl" : people.length === 2 ? "text-base sm:text-3xl" : "text-2xl sm:text-3xl"}`}
                    style={{ textShadow: "0 3px 12px rgba(11,30,61,0.55)" }}
                  >
                    {p.nama}
                  </p>
                  {p.absen && <p className="mt-1 text-[11px] font-semibold text-white/80 sm:text-[13px]">Absen {String(p.absen).padStart(2, "0")}</p>}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 max-w-[580px] text-base leading-relaxed text-white/90 sm:text-[17px]">
            Selamat ulang tahun! Semoga sehat, makin semangat kuliahnya, dan semua yang diharapkan tercapai. Dari teman-teman ABSORBING PPTI 28.
          </p>
        </div>

        <div className="relative z-10 mt-auto flex items-end justify-center gap-1 pt-6 sm:gap-6">
          <Sticker name="maskot-balon-1" size={170} />
          <Image src="/perayaan/kue-ulang-tahun.png" alt="" aria-hidden="true" width={252} height={291} className="h-[96px] w-auto sm:h-[150px]" />
          <Sticker name="maskot-balon-2" size={170} mirror />
        </div>

        {/* Konfeti dari klik */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
          {pieces.map((p) => (
            <span
              key={p.id}
              className="k2-burst"
              style={{ left: p.x, top: p.y, background: p.color, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--rot" as string]: `${p.rot}deg` }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

const CARD = "rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.2)] backdrop-blur-md sm:p-7";
const jamWib = (iso: string) => new Date(iso).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const shortOf = (full: string) => STUDENTS.find((s) => s.full === full)?.short ?? full;

// Kirim ucapan + daftar ucapan hari ini, dan daftar ulang tahun bulan ini.
export function BirthdaySection({ info }: { info: BdayInfo }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Wish[] | null>(null);
  const [from, setFrom] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(
    () =>
      fetch("/api/wishes", { cache: "no-store" })
        .then((r) => r.json())
        .then((d: { items?: Wish[] }) => setItems(d.items ?? []))
        .catch(() => setItems([])),
    []
  );
  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/wishes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from, text }) });
      const d = (await res.json().catch(() => ({}))) as { error?: string; wish?: Wish };
      if (!res.ok) throw new Error(d.error ?? "Gagal mengirim ucapan");
      setText("");
      setStatus({ ok: true, text: "Terkirim! Terima kasih sudah memberi ucapan." });
      if (d.wish) setItems((prev) => [d.wish!, ...(prev ?? [])]);
    } catch (err) {
      setStatus({ ok: false, text: (err as Error).message });
    }
    setBusy(false);
  }

  async function remove(w: Wish) {
    if (!confirm(`Hapus ucapan dari ${w.from}?`)) return;
    try {
      await adminFetch("/api/wishes", "DELETE", { id: w.id });
      setItems((prev) => (prev ?? []).filter((x) => x.id !== w.id));
    } catch (err) {
      alert((err as Error).message);
    }
  }

  const names = joinNames(info.today.map((p) => p.nama));
  const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sea-500 focus:ring-2 focus:ring-sea-500/30";

  return (
    <section id="ucapan" className="grid scroll-mt-32 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className={`${CARD} space-y-4`}>
        <h2 className="text-xl font-extrabold text-slate-800">Kirim ucapan</h2>
        <form onSubmit={send} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Nama kamu</span>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className={field} required>
              <option value="">— pilih nama —</option>
              {STUDENTS.map((s) => (
                <option key={s.full} value={s.full}>
                  {s.absen}. {s.full}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Ucapan untuk {names}</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, WISH_MAX))}
              rows={3}
              maxLength={WISH_MAX}
              placeholder="Tulis ucapan singkat..."
              className={`${field} resize-y`}
              required
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-slate-500">
              {items ? `${items.length} ucapan dari teman sekelas` : "Memuat ucapan..."} · {text.length}/{WISH_MAX}
            </p>
            <button
              disabled={busy || !from || !text.trim()}
              className="flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(11,30,61,0.35)] transition hover:bg-navy-800 disabled:opacity-50"
            >
              <Send size={14} /> {busy ? "Mengirim..." : "Kirim ucapan"}
            </button>
          </div>
          {status && (
            <p role="status" className={`rounded-xl px-3 py-2 text-sm font-medium ${status.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {status.text}
            </p>
          )}
        </form>

        {items && items.length > 0 && (
          <ul className="custom-scrollbar max-h-[360px] space-y-2.5 overflow-y-auto pr-1">
            {items.map((w) => (
              <li key={w.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500">
                    {shortOf(w.from)} · {jamWib(w.at)}
                  </p>
                  <p className="mt-0.5 break-words text-sm leading-relaxed text-slate-800">{w.text}</p>
                </div>
                {user && (
                  <button type="button" onClick={() => remove(w)} className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Hapus ucapan dari ${w.from}`}>
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className={`${CARD} space-y-3`}>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
          <Image src="/perayaan/kue-ulang-tahun.png" alt="" aria-hidden="true" width={252} height={291} className="h-[30px] w-auto" />
          Ulang tahun bulan ini
        </h2>
        <ul className="space-y-2">
          {info.month.map((p) => (
            <li key={p.nama} className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${p.days === 0 ? "bg-pink-50" : ""} ${p.days < 0 ? "opacity-55" : ""}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-900 text-sm font-black text-white">{Number(p.mmdd.slice(3))}</span>
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-800">{p.nama}</p>
                <p className={`text-xs font-semibold ${p.days === 0 ? "text-pink-600" : "text-slate-500"}`}>
                  {p.days === 0 ? "Hari ini!" : p.days === 1 ? "Besok" : p.days > 0 ? `${p.days} hari lagi` : "Sudah lewat"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
