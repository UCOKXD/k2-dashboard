"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/lib/content";
import Sticker from "@/components/Sticker";

const fmt = (iso: string) => (iso ? new Date(iso).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" }) : "");

// Galeri dokumentasi kelas. Klik foto untuk melihat besar; panah kiri/kanan untuk berpindah.
export default function GalleryView({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);

  if (!items.length)
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/70 p-5 text-sm text-slate-500 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-md">
        <Sticker name="belum-ada-data" size={120} />
        <p>Foto kegiatan kelas akan muncul di sini setelah admin mengunggahnya.</p>
      </div>
    );

  const cur = open === null ? null : items[open];
  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => setOpen(i)}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl border border-white/60 bg-white/70 text-left shadow-[0_20px_45px_rgba(15,23,42,0.22)] backdrop-blur-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.src} alt={it.caption || "Foto kelas"} loading="lazy" className="w-full transition duration-500 group-hover:scale-[1.03]" />
            {(it.caption || it.at) && (
              <div className="px-4 py-3">
                {it.caption && <p className="text-sm font-semibold text-slate-800">{it.caption}</p>}
                <p className="text-xs text-slate-400">{fmt(it.at)}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {cur && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white" aria-label="Tutup">
            <X />
          </button>
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((open! - 1 + items.length) % items.length);
                }}
                className="absolute left-3 rounded-full bg-white/15 p-2 text-white"
                aria-label="Sebelumnya"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((open! + 1) % items.length);
                }}
                className="absolute right-3 rounded-full bg-white/15 p-2 text-white"
                aria-label="Berikutnya"
              >
                <ChevronRight />
              </button>
            </>
          )}
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.src} alt={cur.caption || "Foto kelas"} className="max-h-[80vh] rounded-2xl object-contain" />
            <figcaption className="mt-3 text-center text-sm text-white/90">
              {cur.caption} <span className="text-white/50">{fmt(cur.at)}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
