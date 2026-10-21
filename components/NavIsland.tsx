"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Armchair,
  BookOpen,
  Calendar,
  Calculator,
  Clock,
  FileText,
  LayoutDashboard,
  Stethoscope,
  GraduationCap,
  Images,
  MessageCircleHeart,
  UsersRound,
} from "lucide-react";

export const MENU = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/", match: "/" },
  { name: "Doa Harian", icon: BookOpen, href: "/doa-harian", match: "/doa-harian" },
  { name: "Izin Sakit", icon: Stethoscope, href: "/izin-sakit", match: "/izin-sakit" },
  { name: "Izin", icon: FileText, href: "/izin", match: "/izin" },
  { name: "Kalender", icon: Calendar, href: "/kalender-acara", match: "/kalender-acara" },
  { name: "Jadwal", icon: GraduationCap, href: "/jadwal", match: "/jadwal" },
  { name: "Waktu", icon: Clock, href: "/waktu", match: "/waktu" },
  { name: "Kalkulator", icon: Calculator, href: "/kalkulator", match: "/kalkulator" },
  { name: "Pelanggaran", icon: AlertTriangle, href: "/pelanggaran", match: "/pelanggaran" },
  { name: "Tempat Duduk", icon: Armchair, href: "/tempat-duduk", match: "/tempat-duduk" },
  { name: "Galeri", icon: Images, href: "/galeri", match: "/galeri" },
  { name: "NGL", icon: MessageCircleHeart, href: "/ngl", match: "/ngl" },
  { name: "Profil", icon: UsersRound, href: "/profil", match: "/profil" },
] as const;

// floating: halaman utama. Island melayang di bawah banner, lalu naik menempel di tengah atas layar saat di-scroll.
// static: halaman lain. Island selalu menempel di atas, tanpa animasi scroll.
// Hanya di tablet & desktop (>=768px); di ponsel diganti bar bawah (MobileNav).
export default function NavIsland({ variant }: { variant: "floating" | "static" }) {
  const path = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== "floating") return;
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const top = parseFloat(getComputedStyle(el).top) || 0;
      setScrolled(el.getBoundingClientRect().top <= top + 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [variant]);

  const docked = variant === "static" || scrolled;

  const nav = (
    <nav
      className={`pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-0.5 overflow-x-auto rounded-full border border-white/[0.12] bg-[rgba(6,18,39,0.86)] p-1.5 text-white shadow-[0_18px_40px_-16px_rgba(6,18,39,0.6)] backdrop-blur-[16px] backdrop-saturate-[1.4] no-scrollbar
        transition-all duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${docked ? "scale-95" : "scale-100"}`}
      aria-label="Menu utama"
    >
      {MENU.map((item) => {
        const Icon = item.icon;
        const active = path === item.match;
        // Menempel di header: nama menu aktif saja (semua nama di layar sangat lebar) supaya tidak menutupi logo/tombol header.
        // Melayang di bawah banner: nama menu aktif selalu tampil, semua nama tampil mulai 1300px.
        const label = docked
          ? `${active ? "ml-2 max-w-[160px] opacity-100 lg:ml-0 lg:max-w-0 lg:opacity-0 min-[1120px]:ml-2 min-[1120px]:max-w-[160px] min-[1120px]:opacity-100" : "max-w-0 opacity-0"} min-[1900px]:ml-2 min-[1900px]:max-w-[160px] min-[1900px]:opacity-100 group-hover:ml-2 group-hover:max-w-[160px] group-hover:opacity-100`
          : `${active ? "ml-2 max-w-[160px] opacity-100" : "max-w-0 opacity-0"} min-[1300px]:ml-2 min-[1300px]:max-w-[160px] min-[1300px]:opacity-100 group-hover:ml-2 group-hover:max-w-[160px] group-hover:opacity-100`;
        return (
          <Link
            key={item.name}
            href={item.href}
            title={item.name}
            aria-current={active ? "page" : undefined}
            className={`group flex h-10 shrink-0 cursor-pointer items-center rounded-full px-3 text-[13px] font-semibold transition-colors duration-200 ${
              active ? "bg-white text-navy-900" : "text-[#c9d6e6] hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={17} className={`shrink-0 ${active ? "text-sea-600" : "text-sea-300"}`} />
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${label}`}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  if (variant === "static") {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-[76px] z-[60] hidden justify-center md:flex lg:top-[6px]">{nav}</div>
    );
  }
  // sticky: menempel otomatis saat posisinya sampai di atas layar, tanpa mengubah tinggi halaman
  return (
    <div ref={ref} className="pointer-events-none sticky top-[76px] z-[60] -mt-7 hidden h-14 justify-center md:flex lg:top-[6px]">
      {nav}
    </div>
  );
}
