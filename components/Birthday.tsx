"use client";
import Image from "next/image";
import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import { Cake } from "lucide-react";
import type { BdayInfo } from "@/lib/birthday";

// Tema ulang tahun: aktif sehari penuh (WIB) kalau ada yang ulang tahun. Data dihitung di server (/api/birthday).
const EMPTY: BdayInfo = { today: [], month: [] };
const Ctx = createContext<BdayInfo>(EMPTY);
export const useBirthday = () => useContext(Ctx);

export function BirthdayProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<BdayInfo>(EMPTY);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/birthday")
        .then((r) => r.json())
        .then((d: BdayInfo) => alive && setInfo({ today: d.today ?? [], month: d.month ?? [] }))
        .catch(() => {});
    load();
    const id = setInterval(load, 10 * 60_000); // tema ikut berganti kalau tab dibiarkan terbuka melewati tengah malam
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // Latar halaman (body) ikut hangat lewat kelas di <html>, seperti cara mode gelap bekerja.
  const active = info.today.length > 0;
  useEffect(() => {
    document.documentElement.classList.toggle("k2-bday", active);
  }, [active]);

  return <Ctx.Provider value={info}>{children}</Ctx.Provider>;
}

// "A", "A & B", "A, B & C"
export function joinNames(names: string[]) {
  return names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export const HEADER_BDAY = "linear-gradient(90deg, rgba(11,30,61,0.92), rgba(27,58,107,0.85) 45%, rgba(240,140,163,0.88))";

// Topi pesta kecil di atas logo K2.
export function PartyHat() {
  return (
    <Image
      src="/perayaan/topi-pesta.png"
      alt=""
      aria-hidden="true"
      width={149}
      height={254}
      className="pointer-events-none absolute left-[9px] top-[-7px] h-auto w-[20px] -rotate-[18deg]"
    />
  );
}

export function BirthdayBadge() {
  return (
    <span className="hidden items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold text-white sm:flex lg:hidden xl:flex">
      <Cake size={14} /> Hari ulang tahun
    </span>
  );
}

// Tiga bunting menggantung di bawah header. Beranda sedikit lebih besar.
export function TopBunting({ big }: { big: boolean }) {
  return (
    <div aria-hidden="true" className="k2-bd-flag pointer-events-none absolute inset-x-0 top-14 z-[1] flex items-start justify-between px-3">
      <Image src="/perayaan/bunting-pink.png" alt="" width={531} height={159} className="h-auto" style={{ width: big ? "32%" : "26%" }} />
      <Image src="/perayaan/bunting-pastel.png" alt="" width={549} height={181} className="h-auto" style={{ width: big ? "30%" : "24%", marginTop: big ? 10 : 8 }} />
      <Image src="/perayaan/bunting-pink.png" alt="" width={531} height={159} className="h-auto -scale-x-100" style={{ width: big ? "32%" : "26%" }} />
    </div>
  );
}

// Strip ajakan di halaman selain beranda.
export function BirthdayStrip() {
  const { today } = useBirthday();
  if (!today.length) return null;
  return (
    <Link href="/#ucapan" className="k2-bd-strip mb-6 flex flex-wrap items-center gap-4 rounded-3xl px-5 py-3.5 shadow-[0_14px_34px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5">
      <Image src="/perayaan/kue-ulang-tahun.png" alt="" aria-hidden="true" width={252} height={291} className="h-[52px] w-auto" />
      <p className="min-w-0 flex-[1_1_280px] text-[15px] leading-snug text-slate-700">
        <b className="k2-bd-name">Hari ini ulang tahun {joinNames(today.map((p) => p.nama))}.</b> Jangan lupa kasih ucapan!
      </p>
      <span className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow">Kirim ucapan</span>
    </Link>
  );
}

// Satu bunting di bagian paling bawah konten (tetap menggantung ke bawah, tidak dibalik).
export function BottomBunting() {
  return (
    <div aria-hidden="true" className="pointer-events-none mt-10 flex justify-center">
      <Image src="/perayaan/bunting-pastel.png" alt="" width={549} height={181} className="h-auto max-w-[520px] opacity-85" style={{ width: "46%" }} />
    </div>
  );
}
