"use client";
import { useEffect, useRef, useState } from "react";

// Foto profil diambil dari foto akun di web K2 (/api/avatar/<absen>). Kalau belum ada atau gagal dimuat, tampil huruf awal nama.
export default function Foto({ absen, nama }: { absen: number; nama: string }) {
  const [gagal, setGagal] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // Gambar bisa gagal sebelum React aktif, jadi onError saja tidak cukup: cek juga status gambar saat halaman sudah hidup.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setGagal(true);
  }, []);

  return (
    <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-line-strong bg-accent-soft font-display text-4xl font-bold text-accent-ink">
      {gagal ? (
        <span aria-label={`Foto ${nama}`} role="img">
          {nama[0]}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={img} width={320} height={320} src={`/api/avatar/${absen}`} alt={`Foto ${nama}`} onError={() => setGagal(true)} className="h-full w-full object-cover" />
      )}
    </span>
  );
}
