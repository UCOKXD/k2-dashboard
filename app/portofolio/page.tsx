import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FOKUS, KEAHLIAN, KONTAK, PROFIL, PROYEK, TENTANG } from "./data";

export const metadata: Metadata = {
  title: `${PROFIL.nama} | Portofolio`,
  description: `${PROFIL.panggilan}, ${PROFIL.peran} di ${PROFIL.kampus}. ${PROFIL.kutipan}`,
  openGraph: {
    title: `${PROFIL.nama} | Portofolio`,
    description: PROFIL.kutipan,
    type: "profile",
    locale: "id_ID",
  },
};

// Halaman mini untuk link di bio Instagram, arah desainnya di DESIGN.md bagian "Halaman portofolio".
// Tampil sendiri tanpa header dan menu dashboard K2 (lihat Shell.tsx). Server component murni tanpa JS tambahan,
// dibuat statis saat build supaya cepat dimuat.

const FOKUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const NAVY = "#0b1e3d"; // kartu "terminal" dan kartu proyek tetap navy jaket di kedua tema

export default function PortofolioPage() {
  const adaFoto = existsSync(join(process.cwd(), "public", PROFIL.foto));
  const utama = PROYEK[0];
  const tautan = [
    KONTAK.instagram && { label: "Instagram", href: `https://www.instagram.com/${encodeURIComponent(KONTAK.instagram)}/` },
    KONTAK.linkedin && { label: "LinkedIn", href: `https://www.linkedin.com/in/${encodeURIComponent(KONTAK.linkedin)}/` },
    KONTAK.github && { label: "GitHub", href: `https://github.com/${encodeURIComponent(KONTAK.github)}` },
    KONTAK.email && { label: "Email", href: `mailto:${KONTAK.email}` },
  ].filter((t): t is { label: string; href: string } => Boolean(t));

  return (
    <main id="isi">
      {/* Poster: nama raksasa di belakang foto, kutipan, angka angkatan, kartu terminal, kartu proyek. */}
      <section aria-label="Perkenalan" className="relative overflow-hidden border-b border-line">
        {/* Kertas milimeter: kisi tipis seperti kertas gambar teknik. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-6 sm:px-6 md:h-[min(100svh,880px)] md:min-h-[660px] md:px-10 md:pb-0">
          {/* Baris atas */}
          <div className="relative z-30 flex items-center justify-between gap-4 pt-4 md:pt-7">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#0b1e3d] font-display text-[13px] font-extrabold leading-none text-white ring-1 ring-line-strong">
                {PROFIL.panggilan}
              </span>
              <p className="min-w-0 text-[13px] leading-snug">
                <span className="block font-semibold text-ink">{PROFIL.kampus}</span>
                <span className="block truncate text-ink-3">{PROFIL.peran}</span>
              </p>
            </div>
            <nav aria-label="Tautan" className="flex shrink-0 items-center">
              <a href="#proyek" className={`hidden min-h-11 items-center px-3 text-[13px] font-semibold text-ink-2 hover:text-ink md:inline-flex ${FOKUS_RING}`}>
                Proyek
              </a>
              <a href="#tentang" className={`hidden min-h-11 items-center px-3 text-[13px] font-semibold text-ink-2 hover:text-ink md:inline-flex ${FOKUS_RING}`}>
                Tentang
              </a>
              <span aria-hidden="true" className="mx-2 hidden h-4 w-px bg-line-strong md:block" />
              {tautan.map((t) => (
                <a
                  key={t.href}
                  href={t.href}
                  target={t.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-11 items-center gap-1 px-2 text-[13px] font-semibold text-accent-ink hover:underline ${FOKUS_RING}`}
                >
                  {t.label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>

          {/* Nama raksasa (h1). Di HP di atas foto, di layar lebar di tengah di belakang foto. */}
          <h1 className="relative z-0 mt-6 text-center font-display text-[19.5vw] font-extrabold leading-[0.82] tracking-[-0.045em] text-accent md:absolute md:inset-x-0 md:top-[38%] md:mt-0 md:text-[clamp(120px,17.5vw,248px)]">
            <span aria-hidden="true">{PROFIL.namaBesar}</span>
            <span className="sr-only">{PROFIL.nama}</span>
          </h1>

          {/* Foto potong */}
          <div className="relative z-10 mx-auto -mt-[9vw] flex h-[min(110vw,460px)] justify-center md:absolute md:bottom-0 md:left-1/2 md:mt-0 md:h-[84%] md:w-[min(46vw,560px)] md:-translate-x-1/2">
            {adaFoto ? (
              <Image
                src={PROFIL.foto}
                alt={`Foto ${PROFIL.nama}`}
                width={900}
                height={1200}
                priority
                sizes="(min-width: 768px) 560px, 100vw"
                className="h-full w-auto object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_82%,transparent)] md:[mask-image:none]"
              />
            ) : (
              <div className="grid aspect-[3/4] h-full place-items-center rounded-t-full border-2 border-dashed border-line-strong bg-surface/70 px-6 text-center">
                <p className="font-mono text-[13px] leading-relaxed text-ink-3">
                  public{PROFIL.foto}
                  <br />
                  PNG latar transparan
                </p>
              </div>
            )}
          </div>

          {/* Kutipan */}
          <figure className="relative z-20 mt-5 md:absolute md:left-10 md:top-[17%] md:mt-0 md:w-[300px] lg:w-[340px]">
            <span aria-hidden="true" className="font-mono text-[15px] font-semibold text-accent-ink">
              {"//"}
            </span>
            <blockquote className="mt-1 font-display text-[22px] font-bold leading-[1.15] tracking-[-0.01em] text-ink md:text-[24px]">{PROFIL.kutipan}</blockquote>
            <figcaption className="mt-2 text-[13px] text-ink-3">{PROFIL.nama}</figcaption>
          </figure>

          {/* Angka angkatan, diarsir seperti gambar teknik */}
          <p className="absolute right-10 top-[17%] z-20 hidden text-right md:block">
            <span
              aria-hidden="true"
              className="block font-display text-[clamp(110px,11vw,160px)] font-extrabold leading-[0.8] tracking-[-0.04em] text-transparent [-webkit-text-stroke:2px_var(--ink)]"
              style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--ink-3) 0 1px, transparent 1px 7px)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
            >
              {PROFIL.angka}
            </span>
            <span className="mt-2 block text-[13px] text-ink-3">
              {PROFIL.angkaLabel} <span className="font-mono">{PROFIL.angka}</span>
            </span>
          </p>

          <div className="relative z-20 mt-5 grid gap-3 sm:grid-cols-2 md:contents">
            {/* Kartu terminal: bidang fokus */}
            <div
              className="rounded-k2-lg border border-line-strong p-4 font-mono text-[13px] leading-relaxed text-[#eaf0f8] md:absolute md:bottom-8 md:left-10 md:w-[290px]"
              style={{ background: NAVY }}
            >
              <p className="text-[#8fcff1]">
                <span className="text-[#f8c3cf]">ancis@ppti28</span>:~$ whoami --fokus
              </p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4">
                {FOKUS.map((f) => (
                  <div key={f.kunci} className="contents">
                    <dt className="text-[#93a4bc]">{f.kunci}</dt>
                    <dd className="text-white">{f.nilai}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-[#8fcff1]">
                :~$ <span aria-hidden="true" className="inline-block h-[1.05em] w-2 translate-y-[2px] bg-[#8fcff1]" />
              </p>
            </div>

            {/* Kartu proyek utama */}
            {utama && (
              <Link
                href={utama.href ?? "#proyek"}
                className={`group block rounded-k2-lg border border-line-strong p-4 text-white transition hover:border-[#8fcff1] md:absolute md:bottom-8 md:right-10 md:w-[320px] ${FOKUS_RING}`}
                style={{ background: NAVY }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-pill bg-[#f8c3cf] px-2.5 py-1 text-[12px] font-bold text-[#0b1e3d]">Sedang dikelola</span>
                  <span className="font-mono text-[12px] text-[#c3cfdf]">2026</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <Image src="/logo-k2.png" alt="" width={28} height={29} className="h-7 w-7 object-contain" />
                    <span className="font-display text-[17px] font-bold">{utama.judul}</span>
                  </span>
                  <span className="text-right leading-tight">
                    <span className="block font-mono text-[17px] font-semibold">34</span>
                    <span className="block text-[11px] text-[#c3cfdf]">pengguna</span>
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/15 pt-2.5 text-[12px] text-[#c3cfdf]">
                  <span>{utama.teknologi}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#8fcff1] group-hover:underline">
                    {utama.hrefLabel ?? "Lihat"}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Isi tenang di atas kertas */}
      <div className="mx-auto grid w-full max-w-[1280px] gap-12 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:px-10 md:py-20">
        <section id="tentang" aria-labelledby="judul-tentang" className="scroll-mt-6">
          <h2 id="judul-tentang" className="text-[26px] font-bold">
            Tentang saya
          </h2>
          {TENTANG.map((p) => (
            <p key={p.slice(0, 24)} className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
              {p}
            </p>
          ))}
          <h3 className="mt-8 text-[17px] font-bold">Keahlian</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {KEAHLIAN.map((k) => (
              <li key={k} className="rounded-k2-sm border border-line bg-surface px-2.5 py-1 text-[13px] text-ink-2">
                {k}
              </li>
            ))}
          </ul>
        </section>

        <section id="proyek" aria-labelledby="judul-proyek" className="scroll-mt-6">
          <h2 id="judul-proyek" className="text-[26px] font-bold">
            Proyek
          </h2>
          <ol className="mt-4 border-t border-line">
            {PROYEK.map((p, i) => (
              <li key={p.judul} className="grid grid-cols-[2.5rem_1fr] gap-x-2 border-b border-line py-5">
                <span className="font-mono text-[13px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-[19px] font-bold">{p.judul}</h3>
                    <p className="text-[13px] font-semibold text-accent-ink">{p.peran}</p>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{p.deskripsi}</p>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4">
                    {p.teknologi && <p className="py-2 text-[13px] text-ink-3">{p.teknologi}</p>}
                    {p.href && (
                      <Link href={p.href} className={`inline-flex min-h-11 items-center gap-1 text-[14px] font-semibold text-accent-ink underline-offset-4 hover:underline ${FOKUS_RING}`}>
                        {p.hrefLabel ?? "Lihat proyek"}
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-x-6 px-4 py-2 text-[13px] text-ink-3 sm:px-6 md:px-10">
          <p className="py-3">Dibangun dengan Next.js, di-deploy di Vercel.</p>
          <Link href="/" className={`inline-flex min-h-11 items-center underline-offset-4 hover:underline ${FOKUS_RING}`}>
            Bagian dari web K2 PPTI 28
          </Link>
        </div>
      </footer>
    </main>
  );
}
