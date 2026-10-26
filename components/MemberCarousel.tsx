"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { avatarSrc, useAvatars } from "@/components/useAvatars";
import type { MemberCard } from "@/lib/dashboard";

// FlashCard "Yuk Kenalan!!" di beranda (sesuai sketsa): kartu tengah besar & aktif, dua kartu di kiri-kanannya lebih kecil,
// dua kartu paling luar miring & agak transparan. Berganti otomatis tiap 4 detik, kembali ke awal setelah kartu terakhir.
// Berhenti sementara saat disorot/difokus/disentuh atau saat tab tidak terlihat; bisa juga dijeda manual.

const EVERY_MS = 4000;
const RESUME_AFTER_TOUCH_MS = 8000;

// Panah "squircle triangle": segitiga dengan sudut membulat.
function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Profil sebelumnya" : "Profil berikutnya"}
      className="group relative z-30 grid h-14 w-12 shrink-0 place-items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sea-500 sm:h-16 sm:w-14"
    >
      <svg viewBox="0 0 40 44" className={`h-10 w-9 transition-transform duration-200 group-hover:scale-110 group-active:scale-95 sm:h-11 sm:w-10 ${dir === "prev" ? "-scale-x-100" : ""}`} aria-hidden="true">
        <path
          d="M9 6.5c0-3.3 3.6-5.4 6.5-3.7l20 11.9c2.8 1.7 2.8 5.8 0 7.4l-20 11.9C12.6 35.7 9 33.6 9 30.3V6.5z"
          transform="translate(-2 4)"
          className="fill-[rgba(46,155,224,0.38)] stroke-[rgba(31,125,186,0.75)] transition-colors group-hover:fill-[rgba(46,155,224,0.55)] dark:fill-[rgba(143,207,241,0.28)] dark:stroke-[rgba(143,207,241,0.7)]"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Card({ m, src, active, onPick }: { m: MemberCard; src: string | null; active: boolean; onPick: () => void }) {
  return (
    <article
      className={`flex h-full w-full flex-col items-center rounded-[30px] border bg-surface px-5 pb-5 pt-6 text-center shadow-3 ${active ? "border-sea-300" : "cursor-pointer border-line"}`}
      onClick={active ? undefined : onPick}
      aria-hidden={!active}
    >
      <span className="grid aspect-square w-[62%] shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-sea-500 to-navy-700 font-display text-5xl font-bold text-white ring-4 ring-accent-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt={active ? `Foto profil ${m.short}` : ""} loading="lazy" draggable={false} className="h-full w-full object-cover" /> : m.short[0]}
      </span>
      <h3 className="mt-3 line-clamp-2 font-display text-[17px] font-bold leading-tight text-ink">{m.nama}</h3>
      <p className="mt-0.5 font-mono text-[11.5px] text-ink-3">
        {String(m.absen).padStart(2, "0")} · {m.short}
      </p>
      <p className={`mt-2.5 line-clamp-3 w-full rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] leading-snug ${m.bio ? "text-ink-2" : "italic text-ink-3"}`}>
        {m.bio || "Belum ada bio."}
      </p>
      <p className="mt-2 w-full truncate rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] font-semibold text-accent-ink">{m.jabatan}</p>
      {active ? (
        <Link href={`/profil/${m.absen}`} className="mt-auto pt-3 text-sm font-semibold text-accent-ink hover:underline">
          Lihat Profil →
        </Link>
      ) : (
        <span className="mt-auto pt-3 text-sm font-semibold text-ink-3">Lihat Profil →</span>
      )}
    </article>
  );
}

export default function MemberCarousel({ members }: { members: MemberCard[] }) {
  const avatars = useAvatars();
  const n = members.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false); // dijeda manual lewat tombol
  const [hold, setHold] = useState(false); // sedang disorot / difokus / disentuh
  const [wide, setWide] = useState(true);
  const touchTimer = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  // Mulai dari siswa acak supaya tiap kunjungan berkenalan dengan orang yang berbeda.
  useEffect(() => {
    const t = window.setTimeout(() => n && setIdx(Math.floor(Math.random() * n)));
    return () => window.clearTimeout(t);
  }, [n]);

  // Di layar sempit cukup 3 kartu (tengah + intipan kiri-kanan).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const set = () => setWide(mq.matches);
    const t = window.setTimeout(set);
    mq.addEventListener("change", set);
    return () => {
      window.clearTimeout(t);
      mq.removeEventListener("change", set);
    };
  }, []);

  const go = useCallback((d: number) => n && setIdx((i) => (i + d + n) % n), [n]);

  // Ganti otomatis tiap 4 detik. Timer dipasang ulang setiap kali kartu berganti (termasuk lewat panah),
  // jadi navigasi manual tidak bentrok dengan pergantian otomatis.
  useEffect(() => {
    if (paused || hold || n < 2) return;
    const id = window.setTimeout(() => go(1), EVERY_MS);
    return () => window.clearTimeout(id);
  }, [idx, paused, hold, n, go]);

  useEffect(() => () => window.clearTimeout(touchTimer.current), []);

  if (!n) return null;

  const STEP = wide ? 205 : 128; // jarak antarkartu (px)
  const cur = members[idx];

  return (
    <section aria-labelledby="judul-kenalan" className="rounded-k2-xl border border-white/40 bg-[color-mix(in_srgb,var(--surface)_62%,transparent)] px-2 pb-6 pt-7 shadow-2 backdrop-blur-[6px] dark:border-white/10 sm:px-4">
      <h2 id="judul-kenalan" className="text-center font-display text-[clamp(28px,4vw,42px)] font-extrabold tracking-[-0.02em] text-ink">
        Yuk Kenalan!!
      </h2>

      <div
        className="mt-5 flex items-center justify-between gap-1"
        role="region"
        aria-roledescription="carousel"
        aria-label="Kartu profil anggota kelas"
        onMouseEnter={() => setHold(true)}
        onMouseLeave={() => setHold(false)}
        onFocus={() => setHold(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHold(false)}
      >
        <Arrow dir="prev" onClick={() => go(-1)} />

        <div
          className="relative h-[372px] min-w-0 flex-1 touch-pan-y overflow-hidden sm:h-[392px]"
          onPointerDown={(e) => {
            swipe.current = { x: e.clientX, y: e.clientY };
            if (e.pointerType !== "mouse") {
              setHold(true);
              window.clearTimeout(touchTimer.current);
            }
          }}
          onPointerUp={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (s && Math.abs(e.clientX - s.x) > 45 && Math.abs(e.clientX - s.x) > Math.abs(e.clientY - s.y)) go(e.clientX < s.x ? 1 : -1);
            if (e.pointerType !== "mouse") touchTimer.current = window.setTimeout(() => setHold(false), RESUME_AFTER_TOUCH_MS);
          }}
        >
          {members.map((m, i) => {
            // Jarak melingkar ke kartu aktif: -2..2 tampil, sisanya disembunyikan di belakang.
            let d = i - idx;
            if (d > n / 2) d -= n;
            if (d < -n / 2) d += n;
            const a = Math.abs(d);
            const max = wide ? 2 : 1;
            const shown = a <= max;
            const scale = a === 0 ? 1 : a === 1 ? 0.84 : 0.74;
            const rot = a === 2 ? (d > 0 ? 7 : -7) : 0;
            const op = !shown ? 0 : a === 0 ? 1 : a === 1 ? 0.92 : 0.45;
            return (
              <div
                key={m.absen}
                className="absolute left-1/2 top-1/2 h-[352px] w-[228px] transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,.8,.3,1)] motion-reduce:transition-none sm:h-[372px] sm:w-[240px]"
                style={{
                  transform: `translate(-50%, -50%) translateX(${Math.max(-3, Math.min(3, d)) * STEP}px) translateY(${a === 2 ? 14 : 0}px) rotate(${rot}deg) scale(${scale})`,
                  opacity: op,
                  zIndex: 10 - a,
                  pointerEvents: shown ? "auto" : "none",
                  visibility: a > max + 1 ? "hidden" : "visible",
                }}
              >
                <Card m={m} src={avatarSrc(avatars, m.absen) ?? null} active={a === 0} onPick={() => go(d)} />
              </div>
            );
          })}
        </div>

        <Arrow dir="next" onClick={() => go(1)} />
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <p className="font-mono text-xs text-ink-3" aria-live={paused || hold ? "polite" : "off"}>
          {idx + 1} / {n} · <span className="text-ink-2">{cur.short}</span>
        </p>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Lanjutkan pergantian kartu" : "Jeda pergantian kartu"}
          className="grid h-9 w-9 place-items-center rounded-full border border-line-strong bg-surface text-ink-2 hover:border-ink-3"
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </section>
  );
}
