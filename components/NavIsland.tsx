"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Armchair,
  BookOpen,
  Calculator,
  ClipboardList,
  Clock,
  FileText,
  FolderOpen,
  GraduationCap,
  Images,
  LayoutDashboard,
  MessageCircleHeart,
  Mic,
  School,
  Stethoscope,
  Users,
  UsersRound,
} from "lucide-react";

export type MenuItem = { name: string; icon: typeof Clock; href: string; match: string };
export type MenuEntry = MenuItem | { name: string; icon: typeof Clock; children: MenuItem[] };

// Menu dirangkum per kelompok (dropdown).
export const MENU_GROUPS: MenuEntry[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/", match: "/" },
  { name: "Doa Harian", icon: BookOpen, href: "/doa-harian", match: "/doa-harian" },
  {
    name: "Laporan",
    icon: FolderOpen,
    children: [
      { name: "Izin Sakit", icon: Stethoscope, href: "/izin-sakit", match: "/izin-sakit" },
      { name: "Izin Tidak Masuk", icon: FileText, href: "/izin", match: "/izin" },
      { name: "Pelanggaran", icon: AlertTriangle, href: "/pelanggaran", match: "/pelanggaran" },
    ],
  },
  {
    name: "Perkuliahan",
    icon: School,
    children: [
      { name: "Tempat Duduk", icon: Armchair, href: "/tempat-duduk", match: "/tempat-duduk" },
      { name: "Jadwal", icon: GraduationCap, href: "/jadwal", match: "/jadwal" },
      { name: "Tugas & Kalender", icon: ClipboardList, href: "/kalender-acara", match: "/kalender-acara" },
      { name: "Kalkulator", icon: Calculator, href: "/kalkulator", match: "/kalkulator" },
      { name: "Rekam Suara", icon: Mic, href: "/rekam", match: "/rekam" },
    ],
  },
  { name: "Waktu", icon: Clock, href: "/waktu", match: "/waktu" },
  { name: "Galeri", icon: Images, href: "/galeri", match: "/galeri" },
  {
    name: "Social",
    icon: Users,
    children: [
      { name: "NGL", icon: MessageCircleHeart, href: "/ngl", match: "/ngl" },
      { name: "Profil", icon: UsersRound, href: "/profil", match: "/profil" },
    ],
  },
];

// Semua tautan dalam satu daftar (dipakai di tempat lain).
export const MENU: MenuItem[] = MENU_GROUPS.flatMap((e) => ("children" in e ? e.children : [e]));
export const isActive = (path: string, m: MenuItem) => (m.match === "/" ? path === "/" : path === m.match || path.startsWith(`${m.match}/`));

const ITEM = "group relative grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-200";

// Tombol ikon dengan label kecil yang muncul saat disorot/fokus.
function Tip({ text }: { text: string }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-k2-md bg-[#061227] px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-3 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
      {text}
    </span>
  );
}

// floating: halaman utama. Island melayang di bawah banner, lalu naik menempel di tengah atas layar saat di-scroll.
// static: halaman lain. Island selalu menempel di atas, tanpa animasi scroll.
// Hanya ikon (label muncul saat disorot) supaya ringkas; kelompok membuka dropdown.
// Hanya di tablet & desktop (>=768px); di ponsel diganti bar bawah (MobileNav).
export default function NavIsland({ variant }: { variant: "floating" | "static" }) {
  const path = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (variant !== "floating") return;
    // Batas "menempel" dihitung sekali (dan saat ukuran layar berubah), lalu dicek paling sering sekali per frame.
    let stick = 0;
    let frame = 0;
    const measure = () => {
      if (ref.current) stick = parseFloat(getComputedStyle(ref.current).top) || 0;
    };
    const check = () => {
      frame = 0;
      const el = ref.current;
      if (el) setScrolled(el.getBoundingClientRect().top <= stick + 1);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
    };
  }, [variant]);

  // Dropdown terbuka saat kursor mengarah ke tombol kelompok, dan tertutup sebentar setelah kursor pergi
  // (jeda kecil supaya tidak langsung hilang saat kursor bergerak ke daftar). Sentuh/keyboard tetap pakai klik.
  const leaveTimer = useRef(0);
  const hoverOpen = (name: string) => (ev: React.PointerEvent) => {
    if (ev.pointerType !== "mouse") return;
    window.clearTimeout(leaveTimer.current);
    setOpen(name);
  };
  const hoverClose = (ev: React.PointerEvent) => {
    if (ev.pointerType !== "mouse") return;
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setOpen(null), 160);
  };
  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  // Dropdown tertutup saat klik di luar atau Esc.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !nav.current?.contains(e.target as Node) && setOpen(null);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const docked = variant === "static" || scrolled;

  const bar = (
    <nav
      ref={nav}
      className={`pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.12] bg-[rgba(6,18,39,0.86)] p-1.5 text-white shadow-[0_18px_40px_-16px_rgba(6,18,39,0.6)] backdrop-blur-[10px]
        transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${docked ? "scale-95" : "scale-100"}`}
      aria-label="Menu utama"
    >
      {MENU_GROUPS.map((e) => {
        if (!("children" in e)) {
          const active = isActive(path, e);
          return (
            <Link
              key={e.name}
              href={e.href}
              aria-label={e.name}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(null)}
              className={`${ITEM} ${active ? "bg-[#fff] text-[#0b1e3d]" : "text-[#c9d6e6] hover:bg-white/10 hover:text-white"}`}
            >
              <e.icon size={18} className={active ? "text-sea-600" : "text-sea-300"} />
              <Tip text={e.name} />
            </Link>
          );
        }
        const active = e.children.some((c) => isActive(path, c));
        const isOpen = open === e.name;
        return (
          <div key={e.name} className="relative" onPointerEnter={hoverOpen(e.name)} onPointerLeave={hoverClose}>
            <button
              type="button"
              aria-label={e.name}
              aria-expanded={isOpen}
              aria-haspopup="true"
              onClick={(ev) => setOpen((ev.nativeEvent as PointerEvent).pointerType === "mouse" ? e.name : isOpen ? null : e.name)}
              className={`${ITEM} ${active ? "bg-[#fff] text-[#0b1e3d]" : isOpen ? "bg-white/15 text-white" : "text-[#c9d6e6] hover:bg-white/10 hover:text-white"}`}
            >
              <e.icon size={18} className={active ? "text-sea-600" : "text-sea-300"} />
              {!isOpen && <Tip text={e.name} />}
            </button>
            {isOpen && (
              // pt-3 = jembatan tak terlihat antara tombol dan daftar, supaya kursor tidak "keluar" saat turun
              <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 pt-3">
                <div className="k2-drop min-w-[210px] rounded-k2-lg border border-white/[0.12] bg-[rgba(6,18,39,0.97)] p-1.5 shadow-3">
                  <p className="px-3 pb-1 pt-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-sea-300">{e.name}</p>
                  {e.children.map((c) => {
                    const on = isActive(path, c);
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        aria-current={on ? "page" : undefined}
                        onClick={() => setOpen(null)}
                        className={`flex min-h-10 items-center gap-2.5 rounded-k2-md px-3 text-sm font-semibold ${on ? "bg-[#fff] text-[#0b1e3d]" : "text-[#dbe5f0] hover:bg-white/10 hover:text-white"}`}
                      >
                        <c.icon size={16} className={on ? "text-sea-600" : "text-sea-300"} />
                        {c.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  if (variant === "static") {
    return <div className="pointer-events-none fixed inset-x-0 top-[76px] z-[60] hidden justify-center md:flex lg:top-[6px]">{bar}</div>;
  }
  // sticky: menempel otomatis saat posisinya sampai di atas layar, tanpa mengubah tinggi halaman
  return (
    <div ref={ref} className="pointer-events-none sticky top-[76px] z-[60] -mt-7 hidden h-14 justify-center md:flex lg:top-[6px]">
      {bar}
    </div>
  );
}
