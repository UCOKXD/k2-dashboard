"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import NavIsland from "@/components/NavIsland";

// Tombol masuk: halaman login belum dibuat, jadi untuk sementara hanya menampilkan info.
function LoginButton() {
  const [info, setInfo] = useState(false);
  useEffect(() => {
    if (!info) return;
    const id = setTimeout(() => setInfo(false), 2500);
    return () => clearTimeout(id);
  }, [info]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setInfo(true)}
        className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-navy-900 shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-sea-50 sm:text-sm"
      >
        <LogIn size={15} /> Masuk
      </button>
      {info && (
        <div className="animate-fadeIn absolute right-0 top-full mt-2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
          Fitur login segera hadir
        </div>
      )}
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const home = usePathname() === "/";
  return (
    <div className="min-h-screen">
      {/* Header bernuansa laut, senada dengan gelembung biru di kedua logo.
          Di layar lebar island menu menempel di tengah header, jadi isi kiri & kanan dijaga tetap ramping. */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-gradient-to-r from-navy-900/95 via-navy-700/95 to-sea-600/95 px-4 shadow-[0_10px_30px_rgba(11,30,61,0.35)] backdrop-blur-md md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="K2 Pusat Informasi, ke halaman utama">
          <Image src="/logo-k2.png" alt="Logo Divisi K2" width={40} height={41} className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]" priority />
          <Image src="/logo-absorbing.png" alt="Logo kelas Absorbing PPTI 28" width={40} height={42} className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]" priority />
          <Image src="/k2-wordmark.png" alt="K2 Pusat Informasi" width={600} height={235} className="ml-1 h-8 w-auto shrink-0" priority />
        </Link>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white sm:flex lg:hidden xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Siswa Aktif
          </span>
          <LoginButton />
        </div>
      </header>

      {/* Halaman utama memasang islandnya sendiri (melayang + animasi scroll) di dalam HomeDashboard. */}
      {!home && <NavIsland variant="static" />}

      <main className={home ? "" : "mx-auto max-w-6xl p-4 pt-32 sm:p-8 sm:pt-32 lg:pt-24"}>{children}</main>
    </div>
  );
}
