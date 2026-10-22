"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { STICKERS, type StickerName } from "@/lib/stickers";

// Easter egg khusus profil developer (Francis): judul "You Meet The Developer!!", aura biru di kiri/kanan/bawah,
// stiker maskot melayang sambil berguling di latar, dan letupan konfeti + stiker setiap kali latar diklik.
// Semua animasi hanya transform/opacity supaya ringan; dimatikan kalau pengguna memilih gerak dikurangi.

const NAMES = Object.keys(STICKERS) as StickerName[];
const src = (n: StickerName) => `/stickers/sticker-${n}.png`;
const COLORS = ["#2e9be0", "#8fcff1", "#f8c3cf", "#ff8fb3", "#ffd166", "#7c5cff", "#4fd1a1", "#ffffff"];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

type Flyer = { n: StickerName; left: number; size: number; dur: number; delay: number; drift: number; spin: number; flip: boolean };
type Bit = { id: number; x: number; y: number; dx: number; dy: number; rot: number; color: string; shape: 0 | 1 | 2; size: number };
type Pop = { id: number; x: number; y: number; n: StickerName; dx: number; rot: number };
type Ring = { id: number; x: number; y: number };

const makeFlyers = (count: number): Flyer[] =>
  Array.from({ length: count }, (_, i) => ({
    n: NAMES[Math.floor(Math.random() * NAMES.length)],
    left: (i / count) * 100 + rnd(-3, 3),
    size: Math.round(rnd(64, 124)),
    dur: rnd(16, 30),
    delay: -rnd(0, 30), // negatif: sudah di tengah jalan saat halaman dibuka
    drift: Math.round(rnd(-160, 160)),
    spin: Math.round(rnd(240, 720)) * (Math.random() < 0.5 ? -1 : 1),
    flip: Math.random() < 0.5,
  }));

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DevTitle() {
  return (
    <div className="k2-dev-head relative text-center">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-sea-500 dark:text-sea-300">✦ easter egg ditemukan ✦</p>
      <h1 className="k2-dev-title mt-2 font-display text-[clamp(34px,7vw,76px)] font-extrabold leading-[0.95] tracking-[-0.035em]">You Meet The Developer!!</h1>
      <p className="mt-3 text-sm text-ink-3">Klik di mana saja di latar 🎉</p>
    </div>
  );
}

export default function DevEasterEgg() {
  const [mounted, setMounted] = useState(false);
  const [flyers] = useState(() => makeFlyers(typeof window !== "undefined" && window.innerWidth < 640 ? 9 : 16));
  const [bits, setBits] = useState<Bit[]>([]);
  const [pops, setPops] = useState<Pop[]>([]);
  const [rings, setRings] = useState<Ring[]>([]);
  const id = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true));
    const list = timers.current;
    return () => {
      window.clearTimeout(t);
      list.forEach(clearTimeout);
    };
  }, []);

  const burst = useCallback((x: number, y: number, big = false) => {
    const calm = reduced();
    const count = calm ? 0 : big ? 60 : 34;
    const newBits: Bit[] = Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + rnd(-0.25, 0.25);
      const dist = rnd(90, big ? 340 : 230);
      return {
        id: id.current++,
        x,
        y,
        dx: Math.cos(a) * dist,
        dy: Math.sin(a) * dist - rnd(20, 80),
        rot: Math.round(rnd(-720, 720)),
        color: COLORS[i % COLORS.length],
        shape: (i % 3) as 0 | 1 | 2,
        size: Math.round(rnd(7, 13)),
      };
    });
    const newPops: Pop[] = calm
      ? []
      : Array.from({ length: big ? 4 : 2 }, () => ({ id: id.current++, x, y, n: NAMES[Math.floor(Math.random() * NAMES.length)], dx: Math.round(rnd(-170, 170)), rot: Math.round(rnd(-40, 40)) }));
    const ring: Ring = { id: id.current++, x, y };
    const ids = new Set([...newBits.map((b) => b.id), ...newPops.map((p) => p.id), ring.id]);
    setBits((b) => [...b, ...newBits].slice(-240));
    setPops((p) => [...p, ...newPops].slice(-16));
    setRings((r) => [...r, ring].slice(-8));
    const t = window.setTimeout(() => {
      setBits((b) => b.filter((x) => !ids.has(x.id)));
      setPops((p) => p.filter((x) => !ids.has(x.id)));
      setRings((r) => r.filter((x) => !ids.has(x.id)));
      timers.current = timers.current.filter((v) => v !== t);
    }, 1700);
    timers.current.push(t);
  }, []);

  // Sambutan: satu letupan besar di bawah judul saat profil dibuka.
  useEffect(() => {
    const t = window.setTimeout(() => burst(window.innerWidth / 2, Math.min(260, window.innerHeight / 3), true), 450);
    return () => window.clearTimeout(t);
  }, [burst]);

  // Klik di mana saja selain tombol/tautan/isian/menu memunculkan letupan di titik klik (di HP hampir semua area tertutup kartu, jadi kartu ikut dihitung).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || el.closest("a,button,input,textarea,select,label,audio,video,[role=dialog],header,nav,footer")) return;
      burst(e.clientX, e.clientY);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [burst]);

  if (!mounted) return null;
  return createPortal(
    <>
      {/* Latar: aura biru + stiker melayang (di belakang isi halaman, tidak bisa diklik) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <span className="k2-dev-aura k2-dev-aura--l" />
        <span className="k2-dev-aura k2-dev-aura--r" />
        <span className="k2-dev-aura k2-dev-aura--b" />
        {flyers.map((f, i) => (
          <span
            key={i}
            className="k2-dev-fly"
            style={{
              left: `${f.left}%`,
              width: f.size,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
              ["--drift" as string]: `${f.drift}px`,
              ["--spin" as string]: `${f.spin}deg`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(f.n)} alt="" loading="lazy" draggable={false} className={`block h-auto w-full ${f.flip && f.n.startsWith("maskot-balon") ? "-scale-x-100" : ""}`} />
          </span>
        ))}
      </div>

      {/* Letupan dari klik (di atas semua isi, tidak menghalangi klik) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] overflow-hidden">
        {rings.map((r) => (
          <span key={r.id} className="k2-dev-ring" style={{ left: r.x, top: r.y }} />
        ))}
        {bits.map((b) => (
          <span
            key={b.id}
            className="k2-burst k2-dev-bit"
            style={{
              left: b.x,
              top: b.y,
              width: b.size,
              height: b.shape === 0 ? b.size * 1.5 : b.size,
              borderRadius: b.shape === 1 ? "999px" : b.shape === 2 ? "2px" : "3px",
              background: b.color,
              clipPath: b.shape === 2 ? "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" : undefined,
              ["--dx" as string]: `${b.dx}px`,
              ["--dy" as string]: `${b.dy}px`,
              ["--rot" as string]: `${b.rot}deg`,
            }}
          />
        ))}
        {pops.map((p) => (
          <span key={p.id} className="k2-dev-pop" style={{ left: p.x, top: p.y, ["--dx" as string]: `${p.dx}px`, ["--rot" as string]: `${p.rot}deg` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(p.n)} alt="" draggable={false} className="block h-auto w-full" />
          </span>
        ))}
      </div>
    </>,
    document.body,
  );
}
