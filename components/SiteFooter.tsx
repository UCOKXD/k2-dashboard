"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera, CirclePlay, Globe, LayoutDashboard, LogIn, Mail, MessageCircle, Music2 } from "lucide-react";
import type { FooterData, SocialType } from "@/lib/content";
import Sticker from "@/components/Sticker";
import { useAuth } from "@/components/AuthProvider";
import { WA_K2, WA_K2_TEXT } from "@/components/ContactK2";

const ICON: Record<SocialType, typeof Mail> = { instagram: Camera, tiktok: Music2, youtube: CirclePlay, email: Mail, whatsapp: MessageCircle, link: Globe };

// Media sosial dari Panel Admin; diambil sekali per kunjungan.
let socialsCache: Promise<FooterData> | null = null;
function useSocials() {
  const [data, setData] = useState<FooterData>({ socials: [] });
  useEffect(() => {
    socialsCache ??= fetch("/api/content/footer")
      .then((r) => r.json() as Promise<{ data?: FooterData }>)
      .then((d) => d.data ?? { socials: [] })
      .catch(() => ({ socials: [] }));
    let alive = true;
    void socialsCache.then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);
  return data.socials;
}

// Footer di semua halaman: pita "Ada pertanyaan?" (WhatsApp K2 + pintu masuk admin), lalu identitas kelas,
// media sosial (diisi Admin Website), dan hak cipta.
export default function SiteFooter() {
  const { user, ready } = useAuth();
  const onLogin = usePathname() === "/masuk";
  const socials = useSocials();
  return (
    <footer className="k2-footer relative mt-16 text-[#c9d6e6] print:hidden">
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

      <div className="k2-footer-laut relative overflow-hidden border-t border-white/[0.06]">
        <div className="relative mx-auto flex max-w-[calc(var(--wadah)+var(--gutter)*2)] flex-col items-center px-[var(--gutter)] pb-8 pt-12 text-center">
          <div className="flex items-center gap-2">
            <Image src="/logo-k2.png" alt="Logo Divisi K2" width={64} height={66} className="h-16 w-16 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]" />
            <Image src="/logo-absorbing.png" alt="Logo kelas ABSORBING PPTI 28" width={64} height={67} className="h-16 w-16 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]" />
          </div>
          <p className="mt-5 max-w-[38ch] font-display text-[clamp(17px,2vw,21px)] font-semibold leading-snug text-white text-balance">
            A Journey To Absorb Knowledge, Insights And Valuable Memories Together
          </p>
          {socials.length > 0 && (
            <>
              <p className="mt-9 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-axo-300">Media Sosial Kami</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-3">
                {socials.map((x) => {
                  const Icon = ICON[x.type];
                  return (
                    <li key={x.url}>
                      <a
                        href={x.url}
                        target={x.type === "email" ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2.5 text-[15px] text-[#e6eef7] transition hover:text-white"
                      >
                        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                        {x.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <p className="mt-10 text-sm text-[#c9d6e6]">Copyright © {new Date().getFullYear()} PPTI 28 - ABSORBING. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
