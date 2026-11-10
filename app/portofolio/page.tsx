import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { ADEGAN, KONTAK, KONTAK_UNTUK, MEDIA, PROFIL, UNGGULAN } from "./data";
import Gerak from "./Gerak";
import Kontak from "./Kontak";
import Rakit from "./Rakit";
import "./portofolio.css";

export const metadata: Metadata = {
  title: `${PROFIL.nama} | Portofolio`,
  description: PROFIL.deskripsi,
  openGraph: { title: `${PROFIL.nama} | Portofolio`, description: PROFIL.deskripsi, type: "profile", locale: "id_ID" },
};

// Halaman mini untuk link di bio Instagram. Tata letak dan gerak mengikuti gaya inherited.band
// (baris kecil yang menempel, nama raksasa terpecah, adegan layar penuh, huruf merakit diri, butiran film),
// dengan isi sendiri dan warna kunci K2. Arah desain: DESIGN.md bagian "Halaman portofolio".
// Tampil tanpa header dan menu dashboard K2 (lihat Shell.tsx).

const ada = (p: string) => existsSync(join(process.cwd(), "public", p));
const UNDAK = ["pl-[4.5em]", "", "pl-[3em]"]; // indentasi berundak daftar peran
const NAMA = "pf-tebal text-[15vw] md:text-[clamp(56px,7.2vw,132px)]";

// Penanda untuk gambar yang belum dikirim.
function Penanda({ file }: { file: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#1f7dba] p-4 text-center">
      <p className="font-mono text-[12px] leading-relaxed text-white/80">
        public{file}
        <br />
        belum ada
      </p>
    </div>
  );
}

// Bingkai foto duotone. `zoom` memperbesar gambar (seperti potongan wajah dari dekat di referensi).
function Foto({ src, alt, zoom = 1, posisi = "50% 30%", sizes, geser, prioritas }: { src: string; alt: string; zoom?: number; posisi?: string; sizes: string; geser?: number; prioritas?: boolean }) {
  if (!ada(src)) return <Penanda file={src} />;
  return (
    <div className="pf-foto pf-geser absolute -inset-y-[8%] inset-x-0" data-geser={geser}>
      <Image src={src} alt={alt} fill priority={prioritas} sizes={sizes} className="object-cover" style={{ objectPosition: posisi, transform: zoom === 1 ? undefined : `scale(${zoom})`, transformOrigin: posisi }} />
    </div>
  );
}

function Peran({ baris, tanda, className = "" }: { baris: string[]; tanda: string; className?: string }) {
  return (
    <div className={`pf-peran flex items-start justify-between gap-8 ${className}`}>
      <ul>
        {baris.map((b, i) => (
          <li key={b} className={`whitespace-nowrap ${UNDAK[i % UNDAK.length]}`}>
            {b}
          </li>
        ))}
      </ul>
      <p className="whitespace-pre">{`(  ${tanda}  )`}</p>
    </div>
  );
}

export default function PortofolioPage() {
  const sosial = [
    KONTAK.instagram && { label: "INSTAGRAM", href: `https://www.instagram.com/${encodeURIComponent(KONTAK.instagram)}/` },
    KONTAK.tiktok && { label: "TIKTOK", href: `https://www.tiktok.com/@${encodeURIComponent(KONTAK.tiktok)}` },
    KONTAK.linkedin && { label: "LINKEDIN", href: `https://www.linkedin.com/in/${encodeURIComponent(KONTAK.linkedin)}/` },
    KONTAK.github && { label: "GITHUB", href: `https://github.com/${encodeURIComponent(KONTAK.github)}` },
  ].filter((t): t is { label: string; href: string } => Boolean(t));
  const menu = [
    { label: "BERANDA", href: "#beranda" },
    { label: "TENTANG", href: "#tentang" },
    { label: "PROYEK", href: "#proyek" },
  ];
  const { tentang, fokus, webK2 } = ADEGAN;

  return (
    <main id="isi" className="pf-root relative overflow-x-clip">
      <noscript>
        <style>{".pf-huruf{opacity:1!important;transform:none!important;filter:none!important}"}</style>
      </noscript>
      <Gerak />

      {/* Filter tepi kasar untuk huruf tebal */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="pf-kasar">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Butiran film */}
      <div aria-hidden="true" className="pf-butir pointer-events-none fixed inset-0 z-[60]" />

      {/* Baris kecil yang menempel di layar */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-start justify-between px-4 md:px-5 md:pt-3">
        <a href="#beranda" className="pf-chrome-link">
          {PROFIL.panggilan.toUpperCase()}
        </a>
        <div className="md:absolute md:left-[66.6%] md:top-3">
          <Kontak email={KONTAK.email} tautan={sosial} untuk={KONTAK_UNTUK} menu={[...menu, { label: UNGGULAN.nama, href: `#${UNGGULAN.id}` }]} />
        </div>
        <nav aria-label="Bagian halaman" className="hidden md:block">
          <ul className="flex flex-col items-end">
            {menu.map((m) => (
              <li key={m.href}>
                <a href={m.href} className="pf-chrome-link">
                  {m.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-between px-4 md:px-5 md:pb-2">
        <ul aria-label="Media sosial" className="flex gap-4">
          {sosial.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="pf-chrome-link">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={`#${tentang.id}`} className="pf-chrome-link">
          SCROLL
        </a>
      </div>

      {/* 1. Layar pembuka: foto penuh, nama terpecah selebar layar */}
      <section id="beranda" aria-label="Perkenalan" className="relative h-[100svh] min-h-[560px] overflow-hidden">
        <div className="pf-duo absolute inset-0">
          <Foto src={MEDIA.foto} alt={`Foto ${PROFIL.nama}`} sizes="100vw" geser={-0.18} prioritas />
        </div>
        <h1 className="absolute inset-x-0 top-[44%] z-10 flex -translate-y-1/2 justify-between px-[5%]">
          <span className="sr-only">{PROFIL.nama}</span>
          {PROFIL.pecahan.map((p, i) => (
            <Rakit key={i} as="span" hiasan baris={[p]} garam={i + 11} className="pf-tebal text-[17vw] md:text-[clamp(72px,11.5vw,210px)]" />
          ))}
        </h1>
        <ul className="pf-peran absolute left-[44%] top-[70%] z-10 md:left-[66.6%] md:top-[71%]">
          {PROFIL.sub.map((s, i) => (
            <li key={s} className={["pl-[7em]", "", "pl-[2.2em]"][i % 3]}>
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* 2. Tentang: kotak foto dari dekat di kiri atas, kartu foto di kanan bawah */}
      <section id={tentang.id} aria-label="Tentang" className="relative overflow-hidden pb-20 md:h-[100svh] md:min-h-[600px] md:pb-0">
        <div className="pf-duo relative h-[58svh] w-[84%] md:absolute md:left-0 md:top-0 md:h-[72%] md:w-[62.5%]">
          <Foto src={MEDIA.foto} alt="" zoom={2.1} sizes="(min-width: 768px) 63vw, 84vw" geser={0.08} />
        </div>
        <div className="pf-duo pf-kartu relative z-10 -mt-[26svh] ml-auto mr-4 h-[44svh] w-[48%] md:absolute md:right-[3.5%] md:top-[24%] md:m-0 md:h-[82%] md:w-[32%]">
          <Foto src={MEDIA.foto} alt={`Foto ${PROFIL.nama}`} sizes="(min-width: 768px) 32vw, 48vw" />
        </div>
        <Rakit baris={tentang.nama} indent={["", "pl-[0.65em]"]} garam={21} className={`${NAMA} relative z-20 -mt-[15svh] px-4 md:absolute md:left-[4.5%] md:top-[45%] md:mt-0 md:px-0`} />
        <Peran baris={tentang.peran} tanda={tentang.tanda} className="relative z-20 mt-10 px-4 md:absolute md:left-[63.5%] md:top-[11.5%] md:mt-0 md:w-[31%] md:px-0" />
        <p className="relative z-20 mt-6 max-w-[42ch] px-4 text-[14px] leading-relaxed text-[#c3cfdf] md:absolute md:bottom-[9%] md:left-[4.5%] md:mt-0 md:max-w-[38ch] md:px-0">{PROFIL.deskripsi}</p>
      </section>

      {/* 3. Fokus: bidang biru penuh, potongan foto sangat dekat di kiri, kartu terminal di tengah */}
      <section id={fokus.id} aria-label="Bidang fokus" className="relative overflow-hidden bg-[#1f7dba] pb-20 md:h-[100svh] md:min-h-[600px] md:pb-0">
        <div className="pf-duo relative h-[36svh] w-full md:absolute md:left-0 md:top-0 md:h-full md:w-[34%]">
          <Foto src={MEDIA.foto} alt="" zoom={3.4} posisi="50% 24%" sizes="(min-width: 768px) 34vw, 100vw" geser={0.06} />
        </div>
        <div className="relative z-10 mx-4 -mt-[14svh] bg-[#061227] p-5 font-mono text-[13px] leading-[1.7] md:absolute md:left-[33%] md:top-[10%] md:m-0 md:h-[85%] md:w-[34%] md:p-7 md:text-[14px]">
          <p className="text-[#8fcff1]">
            <span className="text-[#f8c3cf]">ancis@ppti28</span>:~$ whoami --fokus
          </p>
          <dl className="mt-3">
            {fokus.terminal.map((t) => (
              <div key={t.kunci} className="grid grid-cols-[6.2rem_1fr] transition-colors hover:bg-[#8fcff1]/10">
                <dt className="text-[#93a4bc]">{t.kunci}</dt>
                <dd>{t.nilai}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-[#8fcff1]">:~$ ls stack/</p>
          <ul aria-label="Bahasa dan alat" className="mt-3 grid grid-cols-4 items-center gap-x-4 gap-y-5 md:gap-x-6 md:gap-y-7">
            {fokus.logo.map((l) => (
              <li key={l.file} className="h-9 transition-transform duration-300 hover:-translate-y-1 hover:scale-110 motion-reduce:transform-none md:h-11">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/portofolio/logo/${l.file}.webp`} alt={l.nama} loading="lazy" decoding="async" width={160} height={160} className={`mx-auto h-full w-full object-contain ${l.putih ? "[filter:brightness(0)_invert(1)]" : ""}`} />
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[#8fcff1]">
            :~$ <span aria-hidden="true" className="inline-block h-[1.05em] w-2 translate-y-[3px] bg-[#8fcff1]" />
          </p>
        </div>
        <Rakit baris={fokus.nama} indent={["pl-[1.1em]", ""]} garam={31} className={`${NAMA} relative z-20 mt-10 px-4 md:absolute md:right-[4.5%] md:top-[19%] md:mt-0 md:px-0`} />
        <Peran baris={fokus.peran} tanda={fokus.tanda} className="relative z-20 mt-8 px-4 md:absolute md:left-[70%] md:top-[60%] md:mt-0 md:w-[25%] md:px-0" />
      </section>

      {/* 4. Web K2: peran di kiri, kotak keterangan proyek di tengah, bidang biru di kanan */}
      <section id={webK2.id} aria-label="Proyek Web K2" className="relative overflow-hidden pb-20 md:h-[100svh] md:min-h-[740px] md:pb-0">
        <div aria-hidden="true" className="relative h-[22svh] w-full bg-[#1668ad] md:absolute md:right-0 md:top-0 md:h-[92%] md:w-[50%]" />
        <div className="relative z-10 mx-4 -mt-[12svh] flex flex-col bg-[#eef3f8] p-6 text-[#0b1e3d] transition-transform duration-500 hover:-translate-y-1.5 motion-reduce:transform-none md:absolute md:left-[33%] md:top-[8%] md:m-0 md:min-h-[80%] md:w-[34%] md:p-9">
          <div className="pf-mini flex items-center justify-between">
            <span className="flex items-center gap-2.5">
              <Image src="/logo-k2.png" alt="" width={36} height={37} className="h-9 w-9 object-contain" />
              {webK2.label}
            </span>
            <span className="font-mono">{webK2.tahun}</span>
          </div>
          <h3 className="mt-6 font-display text-[clamp(24px,2.4vw,38px)] font-extrabold leading-[1.05] tracking-[-0.02em] md:mt-8">{webK2.judul}</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[#33475f] md:text-[15px]">{webK2.deskripsi}</p>
          <ul className="mt-5 border-t border-[#0b1e3d]/20 text-[14px] md:text-[15px]">
            {webK2.fitur.map((f, i) => (
              <li key={f} className="flex gap-4 border-b border-[#0b1e3d]/20 py-2 transition-[padding] duration-300 hover:pl-2 motion-reduce:transition-none">
                <span className="font-mono text-[12px] leading-[1.9] text-[#4a5d78]">{String(i + 1).padStart(2, "0")}</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-end justify-between gap-4 md:mt-auto">
            <p className="leading-none">
              <span className="font-display text-[clamp(44px,4.6vw,76px)] font-extrabold tracking-[-0.04em]">{webK2.tanda}</span>
              <span className="pf-mini ml-2">{webK2.tandaLabel.toUpperCase()}</span>
            </p>
            <Link href={webK2.href} className="pf-peran pf-garis-putus inline-flex min-h-11 items-center font-semibold">
              {webK2.ajakan}
            </Link>
          </div>
        </div>
        <Rakit baris={webK2.nama} indent={["", "pl-[0.4em]"]} garam={41} className={`${NAMA} relative z-20 mt-10 px-4 md:absolute md:left-[68.5%] md:top-[57%] md:mt-0 md:px-0`} />
        <Peran baris={webK2.peran} tanda={webK2.tahun} className="relative z-20 mt-8 px-4 md:absolute md:left-[4.5%] md:top-[46%] md:mt-0 md:w-[26%] md:px-0" />
      </section>

      {/* 5. SINAU: bagian bergaya "records", cover persegi di kanan */}
      <section id={UNGGULAN.id} aria-label={`Proyek ${UNGGULAN.nama}`} className="pf-tekstur relative overflow-hidden px-4 pb-24 pt-20 md:h-[100svh] md:min-h-[620px] md:p-0">
        <div className="md:absolute md:left-[4.5%] md:top-[15%] md:w-[34%]">
          <h2 data-rakit className="pf-tebal text-[13vw] leading-[0.92] md:text-[clamp(40px,4.6vw,84px)]">
            <span className="sr-only">{UNGGULAN.judul.flat().join(" ")}</span>
            <span aria-hidden="true">
              {UNGGULAN.judul.map((kata, bi) => (
                <span key={bi} className={`flex gap-[0.55em] ${bi ? "pl-[1.9em]" : ""}`}>
                  {kata.map((k, ki) => (
                    <span key={k} className="whitespace-pre">
                      {[...k].map((h, hi) => {
                        const i = bi * 20 + ki * 8 + hi;
                        const a = (s: number) => {
                          const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
                          return x - Math.floor(x);
                        };
                        return (
                          <span key={hi} className="pf-huruf" style={{ "--tx": `${(a(51) - 0.5) * 1.4}em`, "--ty": `${(a(52) - 0.5) * 1.1}em`, "--rot": `${(a(53) - 0.5) * 70}deg`, "--d": `${Math.round(a(54) * 380)}ms` } as React.CSSProperties}>
                            {h}
                          </span>
                        );
                      })}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </h2>
          <p className="pf-peran mt-8">
            {UNGGULAN.dari}
            <span className="block whitespace-pre pl-[4.5em]">{`(  ${UNGGULAN.nama}  )`}</span>
          </p>
          <p className="mt-6 max-w-[40ch] text-[14px] leading-relaxed text-[#c3cfdf]">{UNGGULAN.deskripsi}</p>
        </div>

        <a href={UNGGULAN.href} target="_blank" rel="noopener noreferrer" aria-label={`${UNGGULAN.ajakan} (tab baru)`} className="pf-kartu relative mt-10 block aspect-square w-full overflow-hidden bg-[#0b1e3d] md:absolute md:left-[41%] md:top-[11%] md:mt-0 md:w-[min(49%,76svh)]">
          {ada(MEDIA.sinau) ? (
            <Image src={MEDIA.sinau} alt={`Tampilan ${UNGGULAN.nama}`} fill sizes="(min-width: 768px) 49vw, 100vw" className="object-cover object-top" />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[#1f7dba]">
              <Rakit as="span" hiasan baris={[UNGGULAN.nama]} garam={61} className="pf-tebal text-[22vw] md:text-[clamp(60px,9vw,170px)]" />
              <p className="absolute bottom-3 left-3 font-mono text-[11px] text-white/75">public{MEDIA.sinau} belum ada</p>
            </div>
          )}
        </a>

        <div className="mt-10 md:absolute md:bottom-[13%] md:left-[4.5%] md:mt-0 md:w-[32%]">
          <a href={UNGGULAN.href} target="_blank" rel="noopener noreferrer" className="pf-peran pf-garis-putus flex min-h-11 w-full items-center">
            {UNGGULAN.ajakan}
          </a>
          <ul className="mt-3 flex gap-6">
            {UNGGULAN.tautan.map((t) => (
              <li key={t.label}>
                <a href={t.href} {...(t.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="pf-chrome-link">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
