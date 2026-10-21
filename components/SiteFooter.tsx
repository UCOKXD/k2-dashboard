"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera, CirclePlay, Globe, Mail, MessageCircle, Music2 } from "lucide-react";
import type { FooterData, SocialType } from "@/lib/content";
import Sticker from "@/components/Sticker";
import { WA_K2, WA_K2_TEXT } from "@/components/ContactK2";

const ICON: Record<SocialType, typeof Mail> = {
  instagram: Camera,
  tiktok: Music2,
  youtube: CirclePlay,
  email: Mail,
  whatsapp: MessageCircle,
  link: Globe,
};

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

// Footer di semua halaman: pita singkat "Ada pertanyaan?" (WhatsApp K2), lalu identitas kelas,
// media sosial (diisi Admin Website), dan hak cipta.
export default function SiteFooter() {
  const socials = useSocials();
  return (
    <footer className="k2-footer relative mt-16 text-[#c9d6e6] print:hidden">
      <div className="mx-auto flex max-w-[calc(var(--wadah)+var(--gutter)*2)] flex-wrap items-center gap-x-5 gap-y-3 px-[var(--gutter)] py-6">
        <Sticker name="tanya-k2" size={110} className="-mt-10 !h-[64px] w-auto shrink-0 sm:!h-[76px]" />
        <div className="min-w-[min(100%,240px)] flex-1">
          <h2 className="text-lg font-bold text-white">Ada pertanyaan?</h2>
          <p className="text-sm">Soal izin, jadwal, tugas, tempat duduk, atau pelanggaran, hubungi K2 lewat WhatsApp.</p>
        </div>
        <a
          href={WA_K2}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full sm:w-auto bg-emerald-500 px-5 text-sm font-bold text-white transition hover:bg-emerald-600"
        >
          <MessageCircle size={17} /> Hubungi K2
          <span className="font-mono text-xs font-semibold text-white/90">{WA_K2_TEXT}</span>
        </a>
      </div>

      <div className="k2-footer-laut relative overflow-hidden border-t border-white/[0.08]">
        <div className="relative mx-auto flex max-w-[calc(var(--wadah)+var(--gutter)*2)] flex-col items-center px-[var(--gutter)] pb-8 pt-12 text-center">
          <div className="flex items-center gap-2">
            <Image src="/logo-k2.png" alt="Logo Divisi K2" width={64} height={66} className="h-16 w-16 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]" />
            <Image
              src="/logo-absorbing.png"
              alt="Logo kelas ABSORBING PPTI 28"
              width={64}
              height={67}
              className="h-16 w-16 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]"
            />
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
