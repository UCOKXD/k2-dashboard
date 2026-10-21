"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { avatarSrc, useAvatars } from "@/components/useAvatars";
import { CAWU_MAX, type OrgPeople } from "@/lib/content";
import { STUDENTS } from "@/lib/students";

type Card = { nama: string; jabatan: string };
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];
const URUTAN = ["", "Pertama", "Kedua", "Ketiga", "Keempat", "Kelima", "Keenam"];
const studentOf = (nama: string) => STUDENTS.find((s) => s.full === nama);

// Muncul saat di-scroll: mulai transparan & sedikit turun, lalu terlihat. Kalau JavaScript mati / gerak dikurangi, langsung terlihat.
function useReveal() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...el.querySelectorAll<HTMLElement>("[data-reveal]")];
    items.forEach((x) => x.classList.add("k2-reveal"));
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach((x) => io.observe(x));
    return () => io.disconnect();
  });
  return root;
}

function Person({ c, i, big }: { c: Card; i: number; big?: boolean }) {
  const avatars = useAvatars();
  const s = studentOf(c.nama);
  const src = avatarSrc(avatars, s?.absen);
  const body = (
    <>
      <span
        className={`relative grid place-items-center overflow-hidden rounded-full bg-accent-soft ring-1 ring-line transition duration-300 group-hover:-translate-y-1 group-hover:shadow-3 group-hover:ring-4 group-hover:ring-accent-soft ${
          big ? "h-[clamp(150px,22vw,230px)] w-[clamp(150px,22vw,230px)]" : "h-[clamp(120px,17vw,200px)] w-[clamp(120px,17vw,200px)]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="font-display text-[clamp(40px,6vw,64px)] font-bold text-accent-ink">{(s?.short ?? c.nama)[0]}</span>}
      </span>
      <span className="mt-4 block font-display text-[clamp(16px,1.8vw,21px)] font-semibold leading-tight text-ink">{c.nama}</span>
      <span className="mt-1.5 block font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-[#b4577a] dark:text-axo-300">{c.jabatan}</span>
    </>
  );
  return (
    <li data-reveal style={{ ["--d" as string]: `${(i % 4) * 80}ms` }} className="flex justify-center text-center">
      {s ? (
        <Link href={`/profil/${s.absen}`} className="group flex max-w-[260px] flex-col items-center rounded-k2-lg p-2">
          {body}
        </Link>
      ) : (
        <div className="group flex max-w-[260px] flex-col items-center p-2">{body}</div>
      )}
    </li>
  );
}

function Group({ title, cards, cols }: { title?: string; cards: Card[]; cols: string }) {
  if (!cards.length) return null;
  return (
    <section className="space-y-6">
      {title && (
        <h2 data-reveal className="text-center text-[clamp(22px,2.6vw,30px)] font-bold">
          {title}
        </h2>
      )}
      <ul className={`grid justify-center gap-x-6 gap-y-10 ${cols}`}>
        {cards.map((c, i) => (
          <Person key={`${c.nama}${c.jabatan}`} c={c} i={i} />
        ))}
      </ul>
    </section>
  );
}

// Pengurus kelas per CAWU (gaya "kenalan sama pengurus"), foto = foto profil siswa.
export default function PeopleBoard({ boards, cawu, current }: { boards: Record<number, OrgPeople | null>; cawu: number; current: number }) {
  const ref = useReveal();
  const p = boards[cawu];
  const card = (nama: string, jabatan: string): Card[] => (nama ? [{ nama, jabatan }] : []);
  const div = (label: string, d: { koordinator: string; anggota: string[] }) => [...card(d.koordinator, `${label} · Koordinator`), ...d.anggota.filter(Boolean).map((n) => ({ nama: n, jabatan: label }))];

  return (
    <div ref={ref} key={cawu} className="space-y-16">
      {!p ? (
        <p className="k2-card p-8 text-center text-ink-3">Pengurus CAWU {cawu} belum diisi.</p>
      ) : (
        <>
          {p.komti && (
            <ul className="flex justify-center">
              <Person c={{ nama: p.komti, jabatan: "Komti" }} i={0} big />
            </ul>
          )}
          <Group cards={[...card(p.wakomti, "Wakomti"), ...card(p.sekretaris, "Sekretaris"), ...card(p.bendahara, "Bendahara")]} cols="grid-cols-2 md:grid-cols-3" />
          {p.dpp && (
            <p data-reveal className="text-center font-mono text-sm text-ink-3">
              DPP · <span className="font-semibold text-ink-2">{p.dpp}</span>
            </p>
          )}
          <Group title="Kesiswaan & Kedisiplinan" cards={div("K2", { koordinator: p.koordinator, anggota: p.anggota })} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
          <Group title="Kurikulum" cards={div("Kurikulum", p.kurikulum)} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
          <Group title="IT & Logistik" cards={div("IT & Logistik", p.itl)} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
          <Group title="Publikasi & Dokumentasi" cards={div("PubDok", p.pubdok)} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        </>
      )}
      {cawu !== current && (
        <p className="text-center text-sm text-ink-3">
          Ini arsip CAWU {cawu}. CAWU yang sedang berjalan: CAWU {current}.
        </p>
      )}
    </div>
  );
}

// Pilihan CAWU di kanan atas kepala halaman.
export function CawuPicker({ cawu, current, filled }: { cawu: number; current: number; filled: number[] }) {
  const router = useRouter();
  const path = usePathname();
  return (
    <label className="block text-right">
      <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-sea-300">CAWU / Periode</span>
      <span className="relative inline-block">
        <select
          value={cawu}
          onChange={(e) => router.replace(`${path}?cawu=${e.target.value}`, { scroll: false })}
          className="min-h-11 appearance-none rounded-full border border-white/25 bg-white/10 py-2 pl-4 pr-10 text-[15px] font-semibold text-white backdrop-blur-[6px] outline-none hover:bg-white/15 focus:border-sea-300"
        >
          {Array.from({ length: CAWU_MAX }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n} className="text-[#0b1e3d]">
              {ROMAN[n]} ({URUTAN[n]}){n === current ? " · berjalan" : filled.includes(n) ? "" : " · kosong"}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white" />
      </span>
    </label>
  );
}
