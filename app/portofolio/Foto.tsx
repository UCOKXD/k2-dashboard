"use client";
import { useEffect, useRef, useState } from "react";

// Foto profil diambil dari foto akun di web K2 (/api/avatar/<absen>), sudah di-cache browser sehari. Kalau belum ada atau gagal dimuat, tampil huruf awal nama.
export default function Foto({ absen, nama }: { absen: number; nama: string }) {
  const [gagal, setGagal] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // Gambar bisa gagal sebelum React aktif, jadi onError saja tidak cukup: cek juga status gambar saat halaman sudah hidup.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setGagal(true);
  }, []);

  return (
    <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-line-strong bg-accent-soft font-display text-3xl font-bold text-accent-ink md:h-28 md:w-28 md:text-4xl">
      {gagal ? (
        <span aria-label={`Foto ${nama}`} role="img">
          {nama[0]}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={img} width={224} height={224} src={`/api/avatar/${absen}`} alt={`Foto ${nama}`} fetchPriority="high" decoding="async" onError={() => setGagal(true)} className="h-full w-full object-cover" />
      )}
    </span>
  );
}
