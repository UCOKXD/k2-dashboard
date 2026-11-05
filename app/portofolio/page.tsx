import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Foto from "./Foto";
import { KEAHLIAN, KONTAK, PROFIL, PROYEK } from "./data";

export const metadata: Metadata = {
  title: `${PROFIL.nama} | Portofolio`,
  description: `${PROFIL.panggilan}, ${PROFIL.peran}. ${PROFIL.bio}`,
  openGraph: {
    title: `${PROFIL.nama} | Portofolio`,
    description: PROFIL.bio,
    type: "profile",
    locale: "id_ID",
  },
};

const TOMBOL =
  "flex min-h-12 w-full items-center justify-between gap-3 rounded-k2-md border border-line-strong bg-surface px-4 text-[15px] font-semibold text-ink transition hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

// Halaman mini untuk link di bio Instagram. Tampil sendiri tanpa header dan menu dashboard K2 (lihat Shell.tsx).
export default function PortofolioPage() {
  const tautan = [
    KONTAK.instagram && { label: "Lihat Instagram", detail: `@${KONTAK.instagram}`, href: `https://www.instagram.com/${encodeURIComponent(KONTAK.instagram)}/` },
    KONTAK.linkedin && { label: "Buka LinkedIn", detail: `/${KONTAK.linkedin}`, href: `https://www.linkedin.com/in/${encodeURIComponent(KONTAK.linkedin)}/` },
    KONTAK.github && { label: "Buka GitHub", detail: `/${KONTAK.github}`, href: `https://github.com/${encodeURIComponent(KONTAK.github)}` },
    KONTAK.email && { label: "Kirim email", detail: KONTAK.email, href: `mailto:${KONTAK.email}` },
  ].filter((t): t is { label: string; detail: string; href: string } => Boolean(t));

  return (
    <main id="isi" className="mx-auto w-full max-w-[560px] px-5 pb-14 pt-10 sm:pt-14">
      <header className="flex flex-col items-center text-center">
        <Foto absen={PROFIL.absenFoto} nama={PROFIL.nama} />
        <h1 className="mt-5 text-[clamp(28px,7vw,38px)] font-extrabold leading-[1.05]">{PROFIL.nama}</h1>
        <p className="mt-2 text-[15px] font-semibold text-accent-ink">
          {PROFIL.panggilan} · {PROFIL.peran}
        </p>
        <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-ink-2">{PROFIL.bio}</p>
      </header>

      {tautan.length > 0 && (
        <nav aria-label="Tautan" className="mt-8 flex flex-col gap-2.5">
          {tautan.map((t) => (
            <a key={t.href} href={t.href} target={t.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className={TOMBOL}>
              <span>{t.label}</span>
              <span className="flex min-w-0 items-center gap-1.5 text-[13px] font-normal text-ink-3">
                <span className="truncate font-mono">{t.detail}</span>
                <ArrowUpRight size={16} aria-hidden="true" className="shrink-0" />
              </span>
            </a>
          ))}
        </nav>
      )}

      <section aria-labelledby="proyek" className="mt-12">
        <p className="k2-eyebrow">Yang sudah dikerjakan</p>
        <h2 id="proyek" className="mt-1 text-[26px] font-bold">
          Proyek
        </h2>
        <ul className="mt-5 flex flex-col gap-3.5">
          {PROYEK.map((p) => (
            <li key={p.judul} className="k2-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-[19px] font-bold">{p.judul}</h3>
                <p className="text-[13px] font-semibold text-accent-ink">{p.peran}</p>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{p.deskripsi}</p>
              {p.teknologi && <p className="mt-3 font-mono text-[13px] text-ink-3">{p.teknologi}</p>}
              {p.href && (
                <Link
                  href={p.href}
                  className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-accent-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {p.hrefLabel ?? "Lihat proyek"}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="keahlian" className="mt-12">
        <p className="k2-eyebrow">Yang biasa dipakai</p>
        <h2 id="keahlian" className="mt-1 text-[26px] font-bold">
          Keahlian
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {KEAHLIAN.map((k) => (
            <li key={k} className="rounded-k2-sm border border-line bg-surface px-3 py-1.5 text-[14px] text-ink-2">
              {k}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-14 border-t border-line pt-5 text-center text-[13px] text-ink-3">
        <Link href="/" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
          Halaman ini bagian dari web K2 PPTI 28
        </Link>
      </footer>
    </main>
  );
}
