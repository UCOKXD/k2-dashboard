"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NAV = [
  ["/", "Halaman Utama", "🏠"],
  ["/pelanggaran", "Tabel Pelanggaran", "❌"],
  ["/doa-harian", "Tabel Doa Harian", "🙏"],
  ["/izin-sakit", "Tabel Izin Sakit", "😷"],
  ["/izin", "Tabel Izin", "📝"],
  ["/tempat-duduk", "Tempat Duduk", "🪑"],
  ["/kalender-acara", "Kalender Acara", "📅"],
] as const;

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(([href, label, icon]) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-white text-navy-900" : "text-sea-100 hover:bg-white/10"
            }`}
          >
            <span aria-hidden className="mr-2">{icon}</span>{label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-navy-900 lg:block">
        <p className="px-5 py-6 text-lg font-bold text-white">ABSORBING PPTI 28</p>
        <Nav />
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div
            key="bg"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.aside
            key="drawer"
            className="fixed inset-y-0 left-0 z-50 w-60 bg-navy-900 pt-6 lg:hidden"
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ duration: 0.2 }}
          >
            <Nav onNavigate={() => setOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-sea-100 bg-white/90 px-4 py-3 backdrop-blur">
          <button className="rounded-lg p-2 text-xl hover:bg-sea-50 lg:hidden" aria-label="Buka menu" onClick={() => setOpen(true)}>
            ☰
          </button>
          <Image src="/logo-k2.jpg" alt="Logo Divisi K2" width={44} height={44} className="rounded-full" priority />
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold sm:text-lg">Kesiswaan & Kedisiplinan</h1>
            <p className="truncate text-xs italic text-sea-600">Custos Disciplinae et Aequitas</p>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
