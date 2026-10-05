"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Armchair,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
  Stethoscope,
  Users,
} from "lucide-react";

const MENU = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/", match: "/" },
  { name: "Struktur Organisasi", icon: Users, href: "/#organisasi", match: "" },
  { name: "Doa Harian", icon: BookOpen, href: "/doa-harian", match: "/doa-harian" },
  { name: "Izin Sakit", icon: Stethoscope, href: "/izin-sakit", match: "/izin-sakit" },
  { name: "Izin", icon: FileText, href: "/izin", match: "/izin" },
  { name: "Kalender", icon: Calendar, href: "/kalender-acara", match: "/kalender-acara" },
  { name: "Waktu", icon: Clock, href: "/waktu", match: "/waktu" },
  { name: "Pelanggaran", icon: AlertTriangle, href: "/pelanggaran", match: "/pelanggaran" },
  { name: "Tempat Duduk", icon: Armchair, href: "/tempat-duduk", match: "/tempat-duduk" },
] as const;

// floating: halaman utama. Island melayang di bawah banner, lalu menempel di tengah atas layar saat di-scroll.
// static: halaman lain. Island selalu menempel di atas, tanpa animasi scroll.
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
      className={`pointer-events-auto flex max-w-[calc(100vw-1rem)] items-center gap-1 overflow-x-auto rounded-full border border-white/20 bg-black/95 p-2 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl no-scrollbar
        transition-all duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] sm:gap-2 ${docked ? "scale-95 sm:px-4" : "scale-100 sm:px-3"}`}
      aria-label="Menu utama"
    >
      {MENU.map((item) => {
        const Icon = item.icon;
        const active = item.match !== "" && path === item.match;
        // Docked: nama menu terlihat semua di layar lebar (sisanya hanya menu aktif / saat hover).
        // Melayang: nama menu hanya muncul saat hover.
        const label = docked
          ? `${active ? "ml-1 max-w-[160px] opacity-100" : "max-w-0 opacity-0"} min-[1450px]:ml-1 min-[1450px]:max-w-[160px] min-[1450px]:opacity-100 group-hover:ml-1 group-hover:max-w-[160px] group-hover:opacity-100`
          : "max-w-0 opacity-0 sm:group-hover:ml-1 sm:group-hover:max-w-[160px] sm:group-hover:opacity-100";
        return (
          <Link
            key={item.name}
            href={item.href}
            title={item.name}
            aria-current={active ? "page" : undefined}
            className={`group flex shrink-0 cursor-pointer items-center rounded-full px-2.5 py-2 transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:text-white sm:px-3 ${
              active ? "bg-white/15 text-white" : "text-gray-300"
            }`}
          >
            <Icon size={18} className="shrink-0 text-blue-400 transition-transform duration-300 group-hover:scale-125" />
            <span className={`overflow-hidden whitespace-nowrap text-xs font-medium tracking-wide transition-all duration-300 sm:text-sm ${label}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  if (variant === "static") {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-[62px] z-[60] flex justify-center lg:top-[2px]">{nav}</div>
    );
  }
  // sticky: menempel otomatis saat posisinya sampai di atas layar, tanpa mengubah tinggi halaman
  return (
    <div ref={ref} className="pointer-events-none sticky top-[62px] z-[60] -mt-7 flex h-14 justify-center lg:top-[2px]">
      {nav}
    </div>
  );
}
