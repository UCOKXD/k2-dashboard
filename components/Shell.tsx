"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, LayoutDashboard, LogIn, LogOut, UserRound } from "lucide-react";
import AuthProvider, { useAuth } from "@/components/AuthProvider";
import { GRUP_LABEL } from "@/lib/admins";
import ThemeToggle from "@/components/ThemeToggle";
import { avatarSrc, useAvatars } from "@/components/useAvatars";
import NavIsland from "@/components/NavIsland";
import UpdateToasts from "@/components/UpdateToasts";
import MobileNav from "@/components/MobileNav";
import SiteFooter from "@/components/SiteFooter";
import { BirthdayBadge, BirthdayProvider, BirthdayStrip, BottomBunting, HEADER_BDAY, PartyHat, TopBunting, useBirthday } from "@/components/Birthday";

// Kanan atas: tombol Masuk (pengunjung) atau menu akun (siswa & admin).
function AccountButton() {
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const avatars = useAvatars();

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
        className="flex min-h-9 items-center gap-1.5 rounded-full border border-line-strong bg-[#fff] px-4 text-xs font-semibold text-[#0b1e3d] transition hover:bg-[#f1f8fd] sm:text-sm"
      >
        <LogIn size={15} /> Masuk
      </Link>
    );

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex min-h-9 items-center gap-1.5 rounded-full border border-line-strong bg-[#fff] py-1 pl-1 pr-2 text-xs font-semibold text-[#0b1e3d] sm:gap-2 sm:pr-3 sm:text-sm"
      >
        {user.tempPassword && <span aria-label="Password awal belum diganti" className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />}
        {avatarSrc(avatars, user.absen) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarSrc(avatars, user.absen)} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-sea-500 to-navy-700 text-[11px] text-white">{user.panggilan[0]}</span>
        )}
        {/* Nama disembunyikan di layar sempit & saat island menu menempel di header (1024-1279px) supaya tidak bertabrakan. */}
        <span className="hidden sm:inline lg:hidden xl:inline">{user.panggilan}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="animate-fadeIn absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.3)]">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="font-bold text-slate-900">{user.nama}</p>
            <p className="text-xs text-slate-500">{user.admin ? `${user.jabatan} · ${GRUP_LABEL[user.grup]}${user.webAdmin ? " · Admin Website" : ""}` : `${GRUP_LABEL.Siswa} · absen ${user.absen}`}</p>
          </div>
          {user.admin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50">
              <LayoutDashboard size={15} /> Panel Admin
            </Link>
          )}
          <Link href={`/profil/${user.absen}`} onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50">
            <UserRound size={15} /> Profil saya
          </Link>
          <Link href="/akun" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50">
            <KeyRound size={15} /> {user.tempPassword ? <span className="font-semibold text-rose-600">Ganti password awal</span> : "Edit profil & akun"}
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
  return (
    <AuthProvider>
      <BirthdayProvider>
        <Frame>{children}</Frame>
      </BirthdayProvider>
    </AuthProvider>
  );
}

// Halaman publik yang memakai kepala halaman biru (components/PageHero.tsx).
const HERO_PAGES = ["/jadwal", "/izin", "/izin-sakit", "/pelanggaran", "/doa-harian", "/kalender-acara", "/tempat-duduk", "/galeri", "/ngl", "/kalkulator", "/profil"];

function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const home = path === "/";
  const hero = HERO_PAGES.includes(path); // halaman dengan kepala halaman biru (PageHero) di paling atas
  const bday = useBirthday().today.length > 0; // tema ulang tahun aktif hari ini
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip pb-[calc(68px+env(safe-area-inset-bottom))] md:pb-0">
      <a
        href="#isi"
        className="fixed left-3 top-[-60px] z-[100] rounded-k2-md bg-surface px-4 py-2.5 font-bold text-ink shadow-3 transition-[top] focus:top-3"
      >
        Lompat ke isi
      </a>
      {/* Header navy solid. Di layar lebar island menu menempel di tengah header, jadi isi kiri & kanan dijaga tetap ramping. */}
      <header
        className={`k2-header fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-[var(--gutter)] print:hidden ${bday ? "k2-header--fest" : ""}`}
        style={bday ? { background: HEADER_BDAY } : undefined}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="K2 Pusat Informasi, ke halaman utama">
          <span className="relative inline-flex shrink-0">
            <Image src="/logo-k2.png" alt="Logo Divisi K2" width={40} height={41} className="h-[38px] w-[38px] shrink-0 object-contain" priority />
            {bday && <PartyHat />}
          </span>
          <Image src="/logo-absorbing.png" alt="Logo kelas Absorbing PPTI 28" width={40} height={42} className="h-[38px] w-[38px] shrink-0 object-contain" priority />
          <Image src="/k2-wordmark.png" alt="K2 Pusat Informasi" width={600} height={235} className="k2-wordmark ml-1.5 h-7 w-auto shrink-0" priority />
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {bday && <BirthdayBadge />}
          <ThemeToggle />
          <AccountButton />
        </div>
      </header>

      {/* Halaman utama memasang islandnya sendiri (melayang lalu naik menempel saat di-scroll) di dalam HomeDashboard. */}
      {!home && <NavIsland variant="static" />}

      {bday && <TopBunting big={home} />}

      {/* Saat tema ulang tahun, konten diberi jarak atas lebih supaya bunting menggantung di ruang kosong. */}
      {/* Di beranda tidak dibuat lapisan baru, supaya island menu yang menempel tetap di atas header. */}
      <main
        id="isi"
        tabIndex={-1}
        className={`flex-1 outline-none ${
          home ? "" : hero ? "relative mx-auto w-full max-w-[calc(var(--wadah)+var(--gutter)*2)] px-[var(--gutter)] pt-16" : `relative z-[2] mx-auto w-full max-w-6xl p-4 sm:p-8 ${bday ? "pt-32 sm:pt-36 md:pt-44" : "pt-[88px] sm:pt-24 md:pt-36 lg:pt-28"}`
        }`}
      >
        {bday && !home && !hero && <BirthdayStrip />}
        {children}
        {bday && !home && <BottomBunting />}
      </main>
      <SiteFooter />
      <MobileNav />
      <UpdateToasts />
    </div>
  );
}
