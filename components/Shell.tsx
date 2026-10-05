"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavIsland from "@/components/NavIsland";

export default function Shell({ children }: { children: React.ReactNode }) {
  const home = usePathname() === "/";
  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur-md md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image src="/logo-k2.jpg" alt="Logo Divisi K2" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" priority />
          <Image src="/logo-absorbing.jpg" alt="Logo kelas Absorbing PPTI 28" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" priority />
          <div className="min-w-0 leading-tight">
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              Portal K2
            </span>
            <span className="hidden truncate text-[10px] italic text-slate-400 sm:block">Custos Disciplinae et Aequitas</span>
          </div>
        </Link>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Siswa Aktif
        </span>
      </header>

      {/* Halaman utama memasang islandnya sendiri (melayang + animasi scroll) di dalam HomeDashboard. */}
      {!home && <NavIsland variant="static" />}

      <main className={home ? "" : "mx-auto max-w-6xl p-4 pt-32 sm:p-8 sm:pt-32 lg:pt-24"}>{children}</main>
    </div>
  );
}
