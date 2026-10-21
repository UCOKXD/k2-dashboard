"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock, GraduationCap, LayoutDashboard, LayoutGrid, X } from "lucide-react";
import { MENU_GROUPS, isActive, type MenuItem } from "@/components/NavIsland";

// Bar bawah ponsel (<768px) + lembar menu berisi semua menu. Di tablet & desktop diganti NavIsland.
const TABS = [
  { name: "Beranda", icon: LayoutDashboard, href: "/" },
  { name: "Jadwal", icon: GraduationCap, href: "/jadwal" },
  { name: "Waktu", icon: Clock, href: "/waktu" },
  { name: "Pelanggaran", icon: AlertTriangle, href: "/pelanggaran" },
] as const;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const inMenu = !TABS.some((t) => t.href === path);

  // Lembar terbuka: fokus masuk & terkunci di dalam, Esc menutup, halaman di belakang tidak ikut menggulir.
  useEffect(() => {
    if (!open) return;
    const box = panel.current;
    const btn = trigger.current;
    box?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !box) return;
      const items = [...box.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !box.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !box.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      btn?.focus(); // fokus kembali ke tombol Menu
    };
  }, [open]);

  return (
    <>
      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-5 border-t border-white/10 bg-[rgba(6,18,39,0.94)] px-1.5 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] backdrop-blur-[14px] md:hidden print:hidden"
      >
        {TABS.map(({ name, icon: Icon, href }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-k2-md text-[10.5px] font-semibold ${active ? "text-white" : "text-[#a9bad0]"}`}
            >
              <Icon size={20} className={active ? "text-sea-300" : ""} />
              {name}
            </Link>
          );
        })}
        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-current={inMenu ? "page" : undefined}
          className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-k2-md text-[10.5px] font-semibold ${inMenu ? "text-white" : "text-[#a9bad0]"}`}
        >
          <LayoutGrid size={20} className={inMenu ? "text-sea-300" : ""} />
          Menu
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <div className="animate-fadeIn absolute inset-0 bg-[rgba(6,18,39,0.55)]" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-lembar-menu"
            className="k2-sheet absolute inset-x-0 bottom-0 max-h-[82vh] overflow-auto rounded-t-[22px] bg-surface px-[var(--gutter)] pt-3 pb-[calc(24px+env(safe-area-inset-bottom))] text-ink shadow-3"
          >
            <div className="mx-auto mb-4 mt-1 h-1 w-10 rounded bg-line-strong" aria-hidden="true" />
            <div className="mb-3 flex items-center justify-between">
              <h2 id="judul-lembar-menu" className="text-xl font-bold">
                Semua menu
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-2 hover:bg-surface-2"
              >
                <X size={18} />
              </button>
            </div>
            {[
              { name: "", items: MENU_GROUPS.filter((e) => !("children" in e)) as MenuItem[] },
              ...MENU_GROUPS.flatMap((e) => ("children" in e ? [{ name: e.name, items: e.children }] : [])),
            ].map((sec) => (
              <div key={sec.name || "utama"} className="mb-4">
                {sec.name && <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">{sec.name}</p>}
                <ul className="grid grid-cols-3 gap-2">
                  {sec.items.map((m) => {
                    const active = isActive(path, m);
                    const Icon = m.icon;
                    return (
                      <li key={m.href}>
                        <Link
                          href={m.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-k2-md border p-2 text-center text-[13px] font-semibold leading-tight ${
                            active ? "border-accent bg-accent-soft text-ink" : "border-line text-ink"
                          }`}
                        >
                          <Icon size={20} className="text-accent" />
                          {m.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
