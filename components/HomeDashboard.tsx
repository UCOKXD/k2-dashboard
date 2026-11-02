"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  Armchair,
  Cake,
  ClipboardList,
  GraduationCap,
  Images,
  Network,
  Presentation,
  Calendar,
  FileText,
  Pause,
  Play,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import NavIsland from "@/components/NavIsland";
import Sticker from "@/components/Sticker";
import { BirthdayHero, BirthdaySection } from "@/components/BirthdayHome";
import OrgChart from "@/components/OrgChart";
import { LOCAL_DOA_LOG, doaLog } from "@/lib/dashboard";
import HomeCards from "@/components/HomeCards";
import TaskBoard from "@/components/TaskBoard";
import SectionHead from "@/components/SectionHead";
import MemberCarousel from "@/components/MemberCarousel";
import { StatGroup } from "@/components/IzinStats";
import type { TaskItem } from "@/lib/tasks";
import { PHOTO_EVERY_MS } from "@/lib/photos";
import { useGalleryPhotos } from "@/components/useGalleryPhotos";
import Avatar from "@/components/Avatar";
import type { DoaPick } from "@/lib/store";
import type { HomeData, LogType, PelanggaranData } from "@/lib/dashboard";

const CARD = "k2-card";

// Jenis log: ikon yang menggambarkan sumbernya + label. Warna seragam (aksen) supaya isi yang menonjol, bukan kategorinya.
const LOG_STYLE: Record<LogType, { icon: typeof Calendar; badge: string }> = {
  pelanggaran: { icon: AlertTriangle, badge: "Pelanggaran" },
  sakit: { icon: Stethoscope, badge: "Izin sakit" },
  izin: { icon: FileText, badge: "Izin" },
  acara: { icon: Calendar, badge: "Acara" },
  doa: { icon: UserCheck, badge: "Doa harian" },
  seats: { icon: Armchair, badge: "Tempat duduk" },
  org: { icon: Network, badge: "Struktur" },
  slides: { icon: Presentation, badge: "Foto sampul" },
  gallery: { icon: Images, badge: "Galeri" },
  birthdays: { icon: Cake, badge: "Ulang tahun" },
  schedule: { icon: GraduationCap, badge: "Jadwal kuliah" },
  tasks: { icon: ClipboardList, badge: "Tugas" },
  cawu: { icon: Network, badge: "Struktur CAWU" },
  footer: { icon: Network, badge: "Media sosial" },
  "doa-reset": { icon: UserCheck, badge: "Doa harian" },
};

/* Hero */

// Chip tanggal & jam (WIB, 24 jam) di banner, mis. "Rabu, 7 Okt 2026 · 09.41 WIB".
function heroNow() {
  const d = new Date();
  const tgl = d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "short", year: "numeric" });
  const jam = d.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${tgl} · ${jam} WIB`;
}

function HeroClock() {
  const [text, setText] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setText(heroNow()));
    const id = setInterval(() => setText(heroNow()), 15_000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, []);
  return (
    <span className="inline-flex min-h-[32px] items-center gap-2.5 self-start rounded-full border border-white/30 bg-[rgba(6,18,39,0.55)] px-3.5 font-mono text-[12.5px] font-semibold tracking-[0.04em] text-sea-100">
      <span className="h-[7px] w-[7px] rounded-full bg-[#4fd1a1]" aria-hidden="true" />
      {text || "\u00a0"}
    </span>
  );
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Sampul beranda v2: foto kelas selebar layar (foto Galeri bergantian), teks di kiri, stiker HALO! di kanan.
function Hero({ photos }: { photos: string[] }) {
  const SLIDES = useGalleryPhotos(photos);
  const ref = useRef<HTMLDivElement>(null);
  const [step, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES.length ? step % SLIDES.length : 0;

  useEffect(() => {
    // Foto Galeri bergantian setiap 6 detik; berhenti kalau dijeda, fotonya cuma satu, atau pengguna memilih gerak dikurangi.
    if (SLIDES.length < 2 || paused || reducedMotion()) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), PHOTO_EVERY_MS);
    return () => clearInterval(id);
  }, [SLIDES.length, paused]);

  // Isi sampul memudar pelan mengikuti scroll (hanya opacity/transform, tinggi halaman tidak berubah).
  useEffect(() => {
    if (reducedMotion()) return;
    // Diperbarui paling sering sekali per frame, dan berhenti menulis gaya setelah sampul lewat dari layar.
    let frame = 0;
    let last = -1;
    const paint = () => {
      frame = 0;
      const el = ref.current;
      const p = Math.min(window.scrollY / 480, 1);
      if (!el || p === last) return;
      last = p;
      el.style.opacity = String(1 - p * 0.6);
      el.style.transform = `translate3d(0,${-p * 24}px,0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="relative isolate flex items-end overflow-hidden bg-[#0b1e3d] text-white md:min-h-[clamp(520px,72vh,720px)]" aria-label="Sampul beranda">
      {SLIDES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          unoptimized={src.startsWith("/api/")}
          priority={i === 0}
          sizes="100vw"
          className={`-z-20 object-cover object-[62%_70%] transition-opacity duration-1000 ease-in-out md:object-[50%_58%] ${i === slide ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {/* Gelap di kiri (tempat tulisan) dan di bawah, memudar ke kanan supaya foto tetap terlihat. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(6,18,39,.96)_0%,rgba(11,30,61,.75)_55%,rgba(11,30,61,.35)_100%)] md:bg-[linear-gradient(90deg,rgba(6,18,39,.94)_0%,rgba(11,30,61,.78)_38%,rgba(11,30,61,.22)_72%,rgba(11,30,61,.05)_100%),linear-gradient(0deg,rgba(6,18,39,.9)_0%,transparent_42%)]" />

      <div className="relative mx-auto w-full max-w-[calc(var(--wadah)+var(--gutter)*2)] px-[var(--gutter)]">
        <div ref={ref} className="relative flex max-w-[760px] flex-col pb-24 pt-[150px] md:pb-[clamp(88px,10vw,128px)] md:pt-[140px]">
          <HeroClock />
          <h1 className="mt-[22px] text-[clamp(48px,8.4vw,112px)] font-extrabold leading-[0.94] tracking-[-0.035em]">
            Halo, <em className="not-italic text-sea-300">ABSORBERS!</em>
          </h1>
          <p className="mt-5 max-w-[50ch] text-[clamp(16px,1.6vw,19px)] leading-[1.55] text-[#d2deeb]">
            A Journey To Absorb Knowledge, Insights And Valuable Memories Together
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/jadwal" className="inline-flex min-h-11 items-center gap-2 rounded-k2-md bg-[#fff] px-5 text-[15px] font-semibold text-[#0b1e3d] transition hover:bg-[#f1f8fd]">
              <GraduationCap size={17} /> Lihat jadwal
            </Link>
            <Link href="/kalender-acara" className="inline-flex min-h-11 items-center gap-2 rounded-k2-md border border-white/35 px-5 text-[15px] font-semibold text-white transition hover:border-white hover:bg-surface/[0.06]">
              <ClipboardList size={17} /> Tugas aktif
            </Link>
          </div>
        </div>
      </div>

      {SLIDES.length > 1 && (
        <div className="absolute bottom-14 right-[var(--gutter)] z-20 flex items-center md:bottom-10 md:left-[max(var(--gutter),calc((100vw-var(--wadah))/2))] md:right-auto">
          {SLIDES.map((_, i) => (
            // Area sentuh 44 px; titiknya sendiri tetap kecil di tengah.
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className="group -mx-2 grid h-11 min-w-11 place-items-center"
              aria-label={`Tampilkan foto ${i + 1}`}
              aria-current={i === slide ? "true" : undefined}
            >
              <span className={`block h-2.5 rounded-full transition-all duration-300 ${i === slide ? "w-6 bg-[#ffffff]" : "w-2.5 bg-surface/60 group-hover:bg-surface/90"}`} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-pressed={paused}
            aria-label={paused ? "Lanjutkan pergantian foto" : "Jeda pergantian foto"}
            className="ml-1 grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-[rgba(6,18,39,0.55)] text-white hover:bg-[rgba(6,18,39,0.75)]"
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>
      )}

      {/* Di ponsel stiker pindah ke kanan atas (lebih kecil) supaya tidak menutupi tulisan. */}
      <Sticker
        name="halo"
        size={200}
        className="absolute right-[var(--gutter)] top-20 z-10 !h-[104px] md:bottom-[72px] md:top-auto md:!h-[clamp(120px,15vw,196px)] min-[1280px]:right-[calc((100vw-var(--wadah))/2)]"
      />
    </section>
  );
}


/* Log aktivitas */

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function readLocalDoa() {
  try {
    return localStorage.getItem(LOCAL_DOA_LOG) ?? "[]";
  } catch {
    return "[]";
  }
}

// Pilihan bersegmen (44 px) untuk filter kecil.
function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-k2-md border border-line bg-surface-2 p-1">
      {options.map(([v, text]) => (
        <button
          key={String(v)}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`min-h-11 rounded-[8px] px-3.5 text-sm font-semibold transition ${value === v ? "bg-surface text-ink shadow-1" : "text-ink-2 hover:text-ink"}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

// Aktivitas & pengumuman: linimasa (garis kiri + titik), paling bawah beranda.
function LogPanel({ logs }: { logs: HomeData["logs"] }) {
  const [range, setRange] = useState<7 | 14>(14);
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  // Acak doa yang belum tersimpan di server hanya ada di browser ini.
  const raw = useSyncExternalStore(subscribeStorage, readLocalDoa, () => "[]");
  const local = useMemo(() => {
    try {
      return (JSON.parse(raw) as DoaPick[]).map((p, i) => doaLog(p, i));
    } catch {
      return [];
    }
  }, [raw]);

  const shown = [...logs, ...local]
    .filter((l) => l.daysAgo <= range)
    .sort((a, b) => (order === "newest" ? a.daysAgo - b.daysAgo : b.daysAgo - a.daysAgo));

  return (
    <section aria-labelledby="judul-aktivitas" className="space-y-5">
      <SectionHead label="Riwayat" title="Aktivitas & pengumuman" id="judul-aktivitas">
        <div className="flex flex-wrap gap-2">
          <Segmented label="Rentang waktu" value={range} onChange={setRange} options={[[7, "7 hari"], [14, "14 hari"]]} />
          <Segmented label="Urutan" value={order} onChange={setOrder} options={[["newest", "Terbaru dulu"], ["oldest", "Terlama dulu"]]} />
        </div>
      </SectionHead>
      <div className={`${CARD} p-5 sm:p-7`}>
        <p className="mb-5 max-w-[62ch] text-sm text-ink-3">Laporan dari Google Form dan setiap perubahan oleh admin, lengkap dengan nama admin yang mengubah.</p>
        {shown.length > 0 ? (
          <ol className="custom-scrollbar max-h-[440px] overflow-y-auto pr-1">
            {shown.map((log) => {
              const st = LOG_STYLE[log.type] ?? LOG_STYLE.seats;
              const Icon = st.icon;
              return (
                <li key={log.id} className="relative flex gap-4 pb-5 pl-0 last:pb-0 before:absolute before:left-[17px] before:top-10 before:bottom-0 before:w-px before:bg-line last:before:hidden">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                      <span className="font-semibold text-ink">{log.title}</span>
                      <span className="text-ink-3">{st.badge}</span>
                      <span className="ml-auto font-mono text-xs text-ink-3">{log.time}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-2">{log.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Sticker name="belum-ada-data" size={110} />
            <p className="text-sm text-ink-3">Belum ada aktivitas dalam {range} hari terakhir. Coba pilih rentang 14 hari.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// Jenis pelanggaran: batang horizontal satu warna (sama seperti halaman Pelanggaran), diurutkan terbanyak.
function KategoriBars({ pel }: { pel: PelanggaranData }) {
  const { total, categories } = pel;
  const max = Math.max(1, ...categories.map((c) => c.jumlah));
  return (
    <div className={`${CARD} p-5 sm:p-7`}>
      <h3 className="text-lg font-bold">Jenis pelanggaran paling sering</h3>
      <p className="mt-1 text-sm text-ink-3">Dari {total} kasus yang tercatat.</p>
      {categories.length === 0 ? (
        <p className="mt-5 text-sm text-ink-3">Belum ada pelanggaran yang tercatat.</p>
      ) : (
        <ul className="mt-5 space-y-3.5">
          {categories.map((c) => (
            <li key={c.kategori} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 text-sm">
              <span className="truncate font-medium text-ink">{c.kategori}</span>
              <span className="font-mono text-ink-2">
                {c.jumlah} <span className="text-ink-3">· {c.persen}%</span>
              </span>
              <span className="col-span-2 h-2.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                <span className="k2-bar block h-full rounded-full" style={{ width: `${(c.jumlah / max) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Hall of Shame: tiga siswa dengan poin tertinggi (nama dipertahankan sesuai suara kelas).
function HallOfShame({ pel }: { pel: PelanggaranData }) {
  const top = pel.shame;
  return (
    <div className={`${CARD} p-5 sm:p-7`}>
      <h3 className="text-lg font-bold">Hall of Shame</h3>
      <p className="mt-1 text-sm text-ink-3">Tiga siswa dengan poin pelanggaran tertinggi.</p>
      {top.length === 0 ? (
        <p className="mt-5 text-sm text-ink-3">Belum ada pelanggaran yang tercatat.</p>
      ) : (
        <ol className="mt-5 divide-y divide-line">
          {top.map((s, i) => (
            <li key={s.nama} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
              <span className="w-6 shrink-0 font-display text-xl font-extrabold text-bad">{i + 1}</span>
              <Avatar nama={s.nama} className="h-11 w-11 text-base" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{s.nama}</p>
                <p className="truncate text-sm text-ink-3">{s.kategori}</p>
              </div>
              <span className="shrink-0 text-right font-mono text-sm font-semibold text-bad">{s.jumlah} poin</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// Catatan pelanggaran terbaru; status sambungan nyata (diperbarui tiap 15 detik atau terputus).
function RecentPanel({ pel, live }: { pel: PelanggaranData; live: boolean }) {
  return (
    <div className={`${CARD} p-5 sm:p-7`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Catatan terbaru</h3>
          <p className="mt-1 text-sm text-ink-3">Diperbarui otomatis tiap 15 detik.</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${live ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-ok" : "bg-bad"}`} aria-hidden="true" /> {live ? "Tersambung" : "Terputus, mencoba lagi"}
        </span>
      </div>
      {pel.recent.length === 0 ? (
        <p className="mt-5 text-sm text-ink-3">Belum ada catatan.</p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {pel.recent.map((r, i) => (
            <li key={i} className="py-2.5 first:pt-0 last:pb-0">
              <p className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-semibold text-ink">{r.nama}</span>
                <span className="shrink-0 font-mono text-xs text-ink-3">{r.time}</span>
              </p>
              <p className="truncate text-sm text-ink-2">{r.aksi}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Halaman */

export default function HomeDashboard({ data, tasks, today }: { data: HomeData; tasks: TaskItem[]; today: string }) {
  const [pel, setPel] = useState(data.pelanggaran);
  const [live, setLive] = useState(true);

  // Data pelanggaran (sheet + koreksi admin) diambil ulang tiap 15 detik lewat /api/pelanggaran.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/pelanggaran");
        if (!res.ok) throw new Error(String(res.status));
        const next = ((await res.json()) as { data: PelanggaranData }).data;
        if (alive) {
          setPel(next);
          setLive(true);
        }
      } catch {
        if (alive) setLive(false);
      }
    };
    const id = setInterval(tick, 15_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const { stats } = data;

  const bdayToday = data.bday.today.length > 0;

  return (
    <div className="relative min-h-screen overflow-x-clip text-ink">
      {/* Pada hari ada yang ulang tahun, banner foto diganti banner ulang tahun (besoknya kembali normal). */}
      {bdayToday ? <BirthdayHero people={data.bday.today} /> : <Hero photos={data.photos} />}
      {/* Menu pulau melayang di tepi bawah sampul, lalu naik menempel di header saat di-scroll (tablet & desktop). */}
      <NavIsland variant="floating" />

      <div className="mx-auto max-w-[calc(var(--wadah)+var(--gutter)*2)] space-y-[clamp(48px,6vw,72px)] px-[var(--gutter)] pb-4">
        {/* FlashCard "Yuk Kenalan!!" tepat di bawah menu pulau (di ponsel menumpang di bawah sampul). */}
        <div className={`relative z-[3] ${bdayToday ? "mt-8" : "-mt-10 md:mt-6"}`}>
          <MemberCarousel members={data.members} />
        </div>

        {/* Strip "Hari ini" */}
        <div className="relative z-[3] !mt-6">
          <HomeCards cards={data.cards} />
        </div>

        {bdayToday && <BirthdaySection info={data.bday} />}

        <section aria-labelledby="judul-minggu-ini" className="space-y-5">
          <SectionHead label="Minggu ini" title="Tugas & pengumuman" id="judul-minggu-ini" />
          <TaskBoard tasks={tasks} today={today} />
        </section>

        <section aria-labelledby="judul-struktur">
          <SectionHead label="Struktur" title="Pengurus kelas ABSORBING" id="judul-struktur" />
          <OrgChart org={data.org} />
        </section>

        <section aria-labelledby="judul-statistik" className="space-y-5">
          <SectionHead label="Statistik" title="Kedisiplinan kelas" id="judul-statistik" />
          <StatGroup
            items={[
              { label: "Total pelanggaran", value: pel.total, unit: "kasus", sub: "Semua laporan", bad: true },
              { label: "Total izin sakit", value: stats.totalSakit, unit: "izin", sub: "Semua laporan" },
            ]}
          />
          {/* Komposisi asimetris: daftar jenis di kiri, peringkat & catatan terbaru di kanan. */}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <KategoriBars pel={pel} />
            <div className="grid gap-5">
              <HallOfShame pel={pel} />
              <RecentPanel pel={pel} live={live} />
            </div>
          </div>
        </section>

        {/* Log aktivitas & pengumuman di paling bawah halaman. */}
        <LogPanel logs={data.logs} />
      </div>
    </div>
  );
}
