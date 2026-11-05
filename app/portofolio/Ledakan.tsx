"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { LOGO_LEDAKAN } from "./data";

// Logo bahasa & alat yang meledak keluar dari belakang foto begitu halaman di-scroll turun, dan kembali saat ke atas lagi.
// Gambar logo baru dimuat saat browser senggang (atau saat scroll pertama) supaya tidak memperlambat muat awal.
export default function Ledakan() {
  const [pecah, setPecah] = useState(false);
  const [muat, setMuat] = useState(false);

  useEffect(() => {
    let raf = 0;
    const cek = () => {
      const turun = window.scrollY > 24;
      setPecah(turun);
      if (turun) setMuat(true);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(cek);
    };
    raf = requestAnimationFrame(cek);
    window.addEventListener("scroll", onScroll, { passive: true });

    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(() => setMuat(true)) : window.setTimeout(() => setMuat(true), 1500);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  return (
    <div aria-hidden="true" data-pecah={pecah ? "1" : "0"} className="pointer-events-none absolute left-1/2 top-[350px] z-[25] md:top-[52%] md:z-[5]">
      {LOGO_LEDAKAN.map((l, i) => (
        <span
          key={l.nama}
          className="pf-ledak"
          style={{ "--x": `${l.x}px`, "--y": `${l.y}px`, "--xh": `${l.xh}px`, "--yh": `${l.yh}px`, "--r": `${l.r}deg`, "--d": `${i * 45}ms` } as CSSProperties}
        >
          <span title={l.nama} className="pf-ledak-ubin grid h-12 w-12 place-items-center md:h-[76px] md:w-[76px]">
            {muat && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/portofolio/logo/${l.file}.webp`} alt="" width={l.w} height={l.h} decoding="async" className={`pf-logo max-h-full max-w-full object-contain ${l.mono ? "pf-mono" : ""}`} />
            )}
          </span>
        </span>
      ))}
    </div>
  );
}
