"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import AuthProvider, { useAuth } from "@/components/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import NavIsland from "@/components/NavIsland";

// Kanan atas: tombol Masuk (pengunjung) atau menu akun (admin).
function AccountButton() {
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!ready) return <span className="h-8 w-20 rounded-full bg-white/10" />;
  if (!user)
    return (
      <Link
        href="/masuk"
        className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-navy-900 shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-sea-50 sm:text-sm"
      >
        <LogIn size={15} /> Masuk
      </Link>
    );

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-2 text-xs font-bold sm:gap-2 sm:pr-3 text-navy-900 shadow-[0_6px_18px_rgba(0,0,0,0.35)] sm:text-sm"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-sea-500 to-navy-700 text-[11px] text-white">{user.panggilan[0]}</span>
        {/* Nama disembunyikan di layar sempit & saat island menu menempel di header (1024-1279px) supaya tidak bertabrakan. */}
        <span className="hidden sm:inline lg:hidden xl:inline">{user.panggilan}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="animate-fadeIn absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.3)]">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="font-bold text-slate-900">{user.nama}</p>
            <p className="text-xs text-slate-500">
              {user.jabatan} · {user.grup === "BPH" ? "Badan Pengurus Harian" : "Divisi K2"}
            </p>
          </div>
          <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50">
            <LayoutDashboard size={15} /> Panel Admin
          </Link>
          <Link href="/admin?tab=akun" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50">
            <KeyRound size={15} /> Ganti password
          </Link>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await logout();
              router.refresh();
            }}
            className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50"
          >
            <LogOut size={15} /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const home = usePathname() === "/";
  return (
    <AuthProvider>
    <div className="min-h-screen">
      {/* Header bernuansa laut, senada dengan gelembung biru di kedua logo.
          Di layar lebar island menu menempel di tengah header, jadi isi kiri & kanan dijaga tetap ramping. */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-gradient-to-r from-navy-900/85 via-navy-700/80 to-sea-600/80 px-4 shadow-[0_10px_30px_rgba(11,30,61,0.35)] backdrop-blur-md md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="K2 Pusat Informasi, ke halaman utama">
          <Image src="/logo-k2.png" alt="Logo Divisi K2" width={40} height={41} className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]" priority />
          <Image src="/logo-absorbing.png" alt="Logo kelas Absorbing PPTI 28" width={40} height={42} className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]" priority />
          <Image src="/k2-wordmark.png" alt="K2 Pusat Informasi" width={600} height={235} className="ml-1 h-8 w-auto shrink-0" priority />
        </Link>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white sm:flex lg:hidden xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Siswa Aktif
          </span>
          <ThemeToggle />
          <AccountButton />
        </div>
      </header>

      {/* Halaman utama memasang islandnya sendiri (melayang + animasi scroll) di dalam HomeDashboard. */}
      {!home && <NavIsland variant="static" />}

      <main className={home ? "" : "mx-auto max-w-6xl p-4 pt-32 sm:p-8 sm:pt-32 lg:pt-24"}>{children}</main>
    </div>
    </AuthProvider>
  );
}
