"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogIn, MessageCircle } from "lucide-react";
import Sticker from "@/components/Sticker";
import { useAuth } from "@/components/AuthProvider";
import { WA_K2, WA_K2_TEXT } from "@/components/ContactK2";

// Footer pita navy di semua halaman: kontak WhatsApp Divisi K2 + pintu masuk admin.
export default function SiteFooter() {
  const { user, ready } = useAuth();
  const onLogin = usePathname() === "/masuk";
  return (
    <footer className="relative mt-16 bg-navy-950 text-[#c9d6e6] print:hidden">
      <div className="mx-auto grid max-w-[calc(var(--wadah)+var(--gutter)*2)] items-center gap-6 px-[var(--gutter)] py-12 md:grid-cols-[auto_1fr_auto]">
        <Sticker name="tanya-k2" size={110} className="-mt-20 md:-mt-24" />
        <div className="min-w-0">
          <h2 className="text-[clamp(22px,2.6vw,30px)] font-bold text-white">Ada pertanyaan?</h2>
          <p className="mt-1.5 max-w-[54ch] text-sm">
            Soal izin, jadwal, tugas, tempat duduk, atau pelanggaran, hubungi Koordinator K2 atau Komti lewat WhatsApp. Admin (BPH dan Divisi K2) bisa masuk untuk
            memperbarui isi website.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={WA_K2}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            <MessageCircle size={17} /> Hubungi K2
            <span className="font-mono text-xs font-semibold text-white/90">{WA_K2_TEXT}</span>
          </a>
          {ready && !user && !onLogin && (
            <Link href="/masuk" className="flex min-h-11 items-center gap-2 rounded-full bg-[#fff] px-5 text-sm font-semibold text-[#0b1e3d] transition hover:bg-[#f1f8fd]">
              <LogIn size={17} /> Masuk admin
            </Link>
          )}
          {ready && user?.admin && (
            <Link href="/admin" className="flex min-h-11 items-center gap-2 rounded-full bg-[#fff] px-5 text-sm font-semibold text-[#0b1e3d] transition hover:bg-[#f1f8fd]">
              <LayoutDashboard size={17} /> Panel Admin
            </Link>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-[calc(var(--wadah)+var(--gutter)*2)] px-[var(--gutter)]">
        <p className="border-t border-white/[0.08] py-[18px] font-mono text-xs text-[#8da0b9]">Divisi K2 · Kesiswaan &amp; Kedisiplinan · ABSORBING PPTI 28</p>
      </div>
    </footer>
  );
}
