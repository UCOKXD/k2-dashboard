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

const FOKUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const TOMBOL = `flex min-h-11 flex-1 basis-[calc(50%-4px)] items-center justify-between gap-2 rounded-k2-md border border-line-strong bg-surface px-3.5 text-[14px] font-semibold text-ink transition hover:border-ink-3 md:basis-auto ${FOKUS}`;

// Halaman mini untuk link di bio Instagram. Tampil sendiri tanpa header dan menu dashboard K2 (lihat Shell.tsx).
// Server component murni (tanpa JS tambahan selain foto), jadi dibuat statis saat build dan cepat dimuat.
export default function PortofolioPage() {
  const tautan = [
    KONTAK.instagram && { label: "Instagram", href: `https://www.instagram.com/${encodeURIComponent(KONTAK.instagram)}/` },
    KONTAK.linkedin && { label: "LinkedIn", href: `https://www.linkedin.com/in/${encodeURIComponent(KONTAK.linkedin)}/` },
    KONTAK.github && { label: "GitHub", href: `https://github.com/${encodeURIComponent(KONTAK.github)}` },
    KONTAK.email && { label: "Email", href: `mailto:${KONTAK.email}` },
  ].filter((t): t is { label: string; href: string } => Boolean(t));

  return (
    <main id="isi" className="mx-auto w-full max-w-[880px] px-4 py-6 sm:px-6 md:grid md:grid-cols-[260px_1fr] md:items-start md:gap-12 md:py-14">
      <header className="md:sticky md:top-14">
        <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-5">
          <Foto absen={PROFIL.absenFoto} nama={PROFIL.nama} />
          <div className="min-w-0">
            <h1 className="text-[clamp(22px,6vw,28px)] font-extrabold leading-[1.1]">{PROFIL.nama}</h1>
            <p className="mt-1 text-[14px] font-semibold text-accent-ink">
              {PROFIL.panggilan} · {PROFIL.peran}
            </p>
          </div>
        </div>
        <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">{PROFIL.bio}</p>
        {tautan.length > 0 && (
          <nav aria-label="Tautan" className="mt-4 flex flex-wrap gap-2 md:flex-col">
            {tautan.map((t) => (
              <a key={t.href} href={t.href} target={t.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className={TOMBOL}>
                {t.label}
                <ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-ink-3" />
              </a>
            ))}
          </nav>
        )}
      </header>

      <div className="mt-8 md:mt-0">
        <section aria-labelledby="proyek">
          <h2 id="proyek" className="text-[20px] font-bold">
            Proyek
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {PROYEK.map((p) => (
              <li key={p.judul} className="k2-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-[17px] font-bold">{p.judul}</h3>
                  <p className="text-[13px] font-semibold text-accent-ink">{p.peran}</p>
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{p.deskripsi}</p>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4">
                  {p.teknologi && <p className="font-mono text-[12px] text-ink-3">{p.teknologi}</p>}
                  {p.href && (
                    <Link href={p.href} className={`inline-flex min-h-11 items-center gap-1 text-[14px] font-semibold text-accent-ink underline-offset-4 hover:underline ${FOKUS}`}>
                      {p.hrefLabel ?? "Lihat proyek"}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="keahlian" className="mt-8">
          <h2 id="keahlian" className="text-[20px] font-bold">
            Keahlian
          </h2>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {KEAHLIAN.map((k) => (
              <li key={k} className="rounded-k2-sm border border-line bg-surface px-2.5 py-1 text-[13px] text-ink-2">
                {k}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-8 border-t border-line pt-2 text-[13px] text-ink-3">
          <Link href="/" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
            Bagian dari web K2 PPTI 28
          </Link>
        </footer>
      </div>
    </main>
  );
}
