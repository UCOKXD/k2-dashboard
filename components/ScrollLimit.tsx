"use client";
import { useEffect, useRef, useState } from "react";

// Membatasi tinggi daftar sampai `count` item pertama; sisanya digulir di dalam kotak.
// Tinggi diukur dari item ke-`count` (mengikuti jumlah kolom di tiap lebar layar), diukur ulang saat ukuran berubah.
export default function ScrollLimit({ count, label, className = "", children }: { count: number; label: string; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [max, setMax] = useState<number | undefined>(undefined);
  const [more, setMore] = useState(false);
  const [rest, setRest] = useState(0);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const measure = () => {
      const items = box.children;
      if (items.length <= count) {
        setMax(undefined);
        setMore(false);
        return;
      }
      const last = items[count - 1] as HTMLElement;
      setMax(last.offsetTop + last.offsetHeight - (items[0] as HTMLElement).offsetTop + 4);
      setMore(true);
      setRest(items.length - count);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [count]);

  return (
    <>
    <div
      ref={ref}
      className={`${className} ${more ? "overflow-y-auto overscroll-contain rounded-k2-md pr-1 outline-none focus-visible:ring-2 focus-visible:ring-accent" : ""}`}
      style={max ? { maxHeight: max } : undefined}
      tabIndex={more ? 0 : undefined}
      role={more ? "region" : undefined}
      aria-label={more ? label : undefined}
    >
      {children}
    </div>
    {more && <p className="mt-2 text-center text-xs font-semibold text-ink-3">Gulir di dalam kotak untuk {rest} tugas lainnya</p>}
    </>
  );
}
