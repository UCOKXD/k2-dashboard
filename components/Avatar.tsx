"use client";
import { avatarSrc, useAvatars } from "@/components/useAvatars";
import { STUDENTS } from "@/lib/students";

// Foto profil bulat seorang siswa (dicari dari nama lengkap); huruf depan panggilan kalau belum ada foto.
export default function Avatar({ nama, className = "h-12 w-12 text-lg" }: { nama: string; className?: string }) {
  const avatars = useAvatars();
  const s = STUDENTS.find((x) => x.full === nama);
  const src = avatarSrc(avatars, s?.absen);
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-sea-500 to-navy-700 font-display font-bold text-white ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt={`Foto profil ${s?.short ?? nama}`} loading="lazy" className="h-full w-full object-cover" /> : (s?.short ?? nama)[0]}
    </span>
  );
}
