"use client";
import { useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/lib/content";
import { MAX_PHOTOS, shuffle } from "@/lib/photos";

const POLL_MS = 30_000;

// Daftar foto Galeri untuk banner & latar jam yang ikut diperbarui sendiri: foto yang baru disimpan admin
// langsung masuk giliran (tanpa perlu refresh), foto yang dihapus ikut hilang.
export function useGalleryPhotos(initial: string[]) {
  const [photos, setPhotos] = useState(initial);
  const last = useRef<string | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch("/api/content/gallery", { cache: "no-store" });
        const j = (await r.json()) as { data?: GalleryItem[] };
        if (stop || !r.ok || !Array.isArray(j.data)) return;
        const all = [...new Set(j.data.map((g) => g.src))];
        const sig = [...all].sort().join("|");
        if (sig === last.current) return;
        last.current = sig;
        setPhotos((cur) => {
          const kept = cur.filter((src) => all.includes(src));
          const added = shuffle(all.filter((src) => !kept.includes(src)));
          const next = [...kept, ...added].slice(0, MAX_PHOTOS);
          return next.length === cur.length && next.every((x, i) => x === cur[i]) ? cur : next;
        });
      } catch {}
    };
    const id = setInterval(load, POLL_MS);
    const onShow = () => !document.hidden && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      stop = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  return photos;
}
