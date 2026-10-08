"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Activity,
  AlertTriangle,
  Armchair,
  Cake,
  ClipboardList,
  GraduationCap,
  Images,
  Network,
  Presentation,
  BarChart3,
  BellRing,
  Calendar,
  Clock,
  FileText,
  Filter,
  Flame,
  MessageCircle,
  PieChart as PieIcon,
  Search,
  Stethoscope,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import NavIsland from "@/components/NavIsland";
import Sticker from "@/components/Sticker";
import OrgChart from "@/components/OrgChart";
import { LOCAL_DOA_LOG, doaLog } from "@/lib/dashboard";
import HomeCards from "@/components/HomeCards";
import type { SlidesData } from "@/lib/content";
import { STUDENTS } from "@/lib/students";
import type { DoaPick } from "@/lib/store";
import type { HomeData, LogType, PelanggaranData, StudentStat } from "@/lib/dashboard";

// Bayangan sengaja agak gelap supaya kartu terlihat timbul (3D).
const CARD = "rounded-[2.5rem] border border-slate-200/70 bg-white/70 backdrop-blur-md shadow-[0_30px_80px_rgba(15,23,42,0.24)]";
const PIE_COLORS = ["#2563eb", "#6366f1", "#38bdf8", "#f59e0b", "#10b981", "#94a3b8"];

const LOG_STYLE: Record<LogType, { icon: typeof Calendar; badge: string; color: string }> = {
  pelanggaran: { icon: AlertTriangle, badge: "Pelanggaran", color: "bg-rose-50 text-rose-600 border-rose-200" },
  sakit: { icon: Stethoscope, badge: "Izin Sakit", color: "bg-amber-50 text-amber-600 border-amber-200" },
  izin: { icon: FileText, badge: "Izin", color: "bg-sky-50 text-sky-600 border-sky-200" },
  acara: { icon: Calendar, badge: "Input Acara", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  doa: { icon: UserCheck, badge: "Doa Harian", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  seats: { icon: Armchair, badge: "Tempat Duduk", color: "bg-blue-50 text-blue-600 border-blue-200" },
  org: { icon: Network, badge: "Struktur", color: "bg-violet-50 text-violet-600 border-violet-200" },
  slides: { icon: Presentation, badge: "Foto Banner", color: "bg-sky-50 text-sky-600 border-sky-200" },
  gallery: { icon: Images, badge: "Galeri", color: "bg-sky-50 text-sky-600 border-sky-200" },
  birthdays: { icon: Cake, badge: "Ulang Tahun", color: "bg-pink-50 text-pink-600 border-pink-200" },
  schedule: { icon: GraduationCap, badge: "Jadwal Kuliah", color: "bg-sky-50 text-sky-600 border-sky-200" },
  tasks: { icon: ClipboardList, badge: "Tugas", color: "bg-amber-50 text-amber-600 border-amber-200" },
  "doa-reset": { icon: UserCheck, badge: "Doa Harian", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

/* ------------------------------------------------------------------ Hero */

/* ---------------------------------------------------------- Footer bantuan */

const WA_K2 = "https://wa.me/6285134733707";

function HelpFooter() {
  return (
    <footer className="flex flex-wrap items-center gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-r from-navy-900/90 via-navy-700/85 to-sea-600/85 px-6 py-6 text-white shadow-[0_24px_60px_rgba(11,30,61,0.4)] backdrop-blur-md sm:px-8">
      <Sticker name="tanya-k2" size={110} />
      <div className="min-w-0 flex-[1_1_16rem]">
        <p className="text-xl font-extrabold">Ada pertanyaan?</p>
        <p className="mt-1 text-sm text-white/85">Soal izin, jadwal, tugas, tempat duduk, atau pelanggaran, langsung chat Divisi K2 lewat WhatsApp.</p>
      </div>
      <a
        href={WA_K2}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(16,185,129,0.4)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
      >
        <MessageCircle size={17} /> Hubungi K2
        <span className="font-mono text-xs font-semibold text-white/85">0851-3473-3707</span>
      </a>
    </footer>
  );
}

function Hero({ slides }: { slides: SlidesData }) {
  const SLIDES = slides.items.map((x) => x.src);
  const ref = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    // Lama tiap foto diatur admin (Panel Admin > Foto Banner).
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), slides.duration * 1000);
    return () => clearInterval(id);
  }, [SLIDES.length, slides.duration]);

  // Banner memudar dan menyusut mengikuti scroll. Hanya transform/opacity, jadi tinggi halaman tidak berubah.
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const p = Math.min(window.scrollY / 380, 1);
      el.style.opacity = String(1 - p * 0.85);
      el.style.transform = `translateY(${-p * 24}px) scale(${1 - p * 0.05})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="mx-auto max-w-[1000px] px-4 pt-[4.5rem] md:px-0">
      <div
        ref={ref}
        className="relative flex h-[320px] origin-top items-center justify-center overflow-hidden rounded-[2.5rem] border-4 border-white bg-slate-200 shadow-[0_30px_70px_rgba(15,23,42,0.35)] will-change-transform sm:h-[460px]"
      >
        {SLIDES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`Slide foto ${i + 1}`}
            fill
            unoptimized={src.startsWith("/api/")}
            priority={i === 0}
            sizes="1000px"
            className={`object-cover object-[50%_65%] transition-all duration-1000 ease-in-out ${i === slide ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />

        {/* Di ponsel judul dinaikkan sedikit supaya tidak tertutup stiker "Halo!" di pojok kanan bawah. */}
        <div className="relative z-10 -mt-16 px-6 text-center sm:mt-0">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl">
            Pusat Informasi K2
          </h1>
        </div>

        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === slide ? "w-6 bg-white shadow" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
              aria-label={`Pindah ke slide ${i + 1}`}
            />
          ))}
        </div>

        <Sticker name="halo" size={200} className="absolute bottom-4 right-4 z-20 sm:bottom-10 sm:right-12" />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Tooltip */

type Tip = { s: StudentStat; x: number; y: number; below: boolean };

function useStudentTooltip() {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    const hide = () => setTip(null);
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, []);

  // Posisi fixed (dihitung dari elemen yang di-hover) supaya tidak terpotong area scroll.
  const show = (s: StudentStat) => (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const below = r.top < 240;
    setTip({ s, x: Math.min(Math.max(r.left, 8), window.innerWidth - 296), y: below ? r.bottom + 8 : r.top - 8, below });
  };
  return { tip, show, hide: () => setTip(null) };
}

function TipBox({ tip }: { tip: Tip | null }) {
  if (!tip) return null;
  const { s } = tip;
  const info = STUDENTS.find((x) => x.full === s.nama);
  return (
    <div
      className="animate-fadeIn pointer-events-none fixed z-[70] w-72 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-[0_25px_50px_rgba(0,0,0,0.4)]"
      style={{ left: tip.x, top: tip.y, transform: tip.below ? undefined : "translateY(-100%)" }}
    >
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="truncate text-sm font-bold text-blue-400">{s.nama}</span>
        <span className="shrink-0 text-xs text-slate-400">{s.short}</span>
      </div>
      <div className="space-y-1 text-xs text-slate-300">
        {info && (
          <p>
            <strong className="text-slate-200">Absen:</strong> {info.absen} · <strong className="text-slate-200">NIM:</strong> {info.nim}
          </p>
        )}
        <p>
          <strong className="text-slate-200">Total:</strong> {s.kasus} pelanggaran · {s.jumlah} poin
        </p>
        <p className="mt-2 font-semibold text-amber-400">{s.pelanggaran.length ? "Daftar Pelanggaran Terbaru:" : "Belum ada pelanggaran."}</p>
        {s.pelanggaran.length > 0 && (
          <ul className="list-inside list-disc space-y-0.5 pl-1 text-slate-300">
            {s.pelanggaran.map((v, i) => (
              <li key={i} className="truncate">
                {v}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- Log aktivitas */

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
    <div className={`${CARD} p-6 sm:p-8`}>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Sticker name="info-penting" size={130} />
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <BellRing className="h-5 w-5 animate-bounce text-blue-600" /> Log Aktivitas &amp; Pengumuman Terbaru K2
            </h3>
            <p className="text-xs text-slate-400">Semua laporan dari Google Form dan setiap perubahan oleh admin, lengkap dengan nama admin yang mengubah.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
            {([7, 14] as const).map((d) => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  range === d ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {d} Hari Terakhir
              </button>
            ))}
          </div>
          <button
            onClick={() => setOrder(order === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200/70"
          >
            <Filter size={13} />
            {order === "newest" ? "Terbaru ke Terlama" : "Terlama ke Terbaru"}
          </button>
        </div>
      </div>

      <div className="custom-scrollbar max-h-[380px] space-y-3.5 overflow-y-auto pr-1">
        {shown.length > 0 ? (
          shown.map((log) => {
            const st = LOG_STYLE[log.type] ?? LOG_STYLE.seats;
            const Icon = st.icon;
            return (
              <div
                key={log.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-[0_6px_16px_rgba(15,23,42,0.10)] transition-all hover:bg-slate-100/80 sm:items-center"
              >
                <div className="flex min-w-0 items-start gap-3.5 sm:items-center">
                  <div className={`mt-0.5 shrink-0 rounded-xl border p-2.5 sm:mt-0 ${st.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{log.title}</span>
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">{st.badge}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600">{log.detail}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 self-center text-[11px] font-medium text-slate-400 sm:self-auto">
                  <Clock size={12} /> {log.time}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs font-medium text-slate-400">Tidak ada data log aktivitas pada rentang waktu ini.</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Pie chart */

function PieSection({ pel }: { pel: PelanggaranData }) {
  const { total, categories } = pel;
  let acc = 0;
  const stops = categories
    .map((c, i) => {
      const from = acc;
      acc += (c.jumlah / total) * 100;
      return `${PIE_COLORS[i % PIE_COLORS.length]} ${from}% ${acc}%`;
    })
    .join(", ");

  return (
    <section className={`${CARD} space-y-6 p-8 md:p-10`}>
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            <PieIcon size={14} /> Statistik Jenis Pelanggaran
          </span>
          <h3 className="text-2xl font-extrabold text-slate-800">Jenis Pelanggaran Terbanyak</h3>
          <p className="text-xs text-slate-500 sm:text-sm">Proporsi kategori pelanggaran yang sering terjadi di kelas K2.</p>
        </div>
        <span className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">Total {total} Kasus</span>
      </div>

      <div className="grid grid-cols-1 items-center gap-8 pt-4 lg:grid-cols-3">
        <div className="flex justify-center">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-white bg-slate-50 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.25)] sm:h-56 sm:w-56">
            <div
              className="absolute inset-3 rounded-full"
              style={{
                background: total ? `conic-gradient(${stops})` : "#e2e8f0",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 18px), #fff calc(100% - 18px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 18px), #fff calc(100% - 18px))",
              }}
            />
            <div className="z-10 text-center">
              <span className="text-2xl font-black text-slate-800 sm:text-3xl">{total} Kasus</span>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Akumulasi</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {categories.length === 0 && <p className="text-sm text-slate-400">Belum ada pelanggaran yang tercatat.</p>}
          {categories.map((c, i) => (
            <div key={c.kategori} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.12)] transition-all hover:border-blue-300">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-4 w-4 shrink-0 rounded-full shadow-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-slate-800">{c.kategori}</h4>
                  <p className="text-xs font-medium text-slate-400">Berdasarkan persentase kelas</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-sm font-extrabold text-blue-600">{c.jumlah} Kasus</span>
                <p className="mt-0.5 inline-block rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-500">{c.persen}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------- Ringkasan dashboard utama */

function DashboardSection({ pel, live }: { pel: PelanggaranData; live: boolean }) {
  const [query, setQuery] = useState("");
  const { tip, show, hide } = useStudentTooltip();

  const ranked = pel.students.filter((s) => s.jumlah > 0);
  const topThree = pel.shame;
  const pareto = ranked.slice(0, 8);
  const max = pareto[0]?.jumlah ?? 1;

  const q = query.trim().toLowerCase();
  const filtered = pel.students.filter(
    (s) =>
      s.nama.toLowerCase().includes(q) ||
      s.short.toLowerCase().includes(q) ||
      (s.kategori || "bersih").toLowerCase().includes(q)
  );

  const panel = "rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-blue-50/40 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.2)] sm:p-8";

  return (
    <section id="dashboard" className="scroll-mt-32">
      <TipBox tip={tip} />
      <div className="space-y-10 rounded-[2.5rem] border border-slate-200/70 bg-white/70 backdrop-blur-md p-8 shadow-[0_30px_80px_rgba(15,23,42,0.28)] md:p-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 sm:text-3xl">
              <BarChart3 className="h-8 w-8 text-blue-600" /> Ringkasan Dashboard Kedisiplinan
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* A. Hall of Shame */}
          <div className="rounded-3xl border border-rose-100 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:p-7 lg:col-span-2">
            <div className="mb-5 flex items-center gap-2">
              <div className="rounded-xl bg-rose-500 p-2 text-white shadow-md">
                <Flame size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 sm:text-lg">Hall of Shame (Top 3 Teratas)</h3>
                <p className="text-xs text-slate-500">Siswa dengan akumulasi poin pelanggaran tertinggi</p>
              </div>
            </div>
            {topThree.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Belum ada pelanggaran yang tercatat.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                {topThree.map((s, i) => (
                  <div key={s.nama} className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-rose-100 bg-white/70 backdrop-blur-md p-4 shadow-[0_10px_28px_rgba(15,23,42,0.16)] transition-transform hover:scale-[1.02]">
                    <div className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-xs font-black text-rose-600">#{i + 1}</div>
                    <div>
                      <span className="inline-block max-w-[calc(100%-2rem)] truncate rounded-md border border-rose-100 bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-600">
                        {s.kategori}
                      </span>
                      <h4 className="mt-2.5 truncate text-sm font-bold text-slate-800" title={s.nama}>{s.nama}</h4>
                      <p className="mt-0.5 text-[11px] text-slate-400">Panggilan: {s.short}</p>
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-2.5">
                      <span className="text-xs font-semibold text-rose-600">{s.jumlah} Poin</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B. History terbaru (live) */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-[0_24px_55px_rgba(15,23,42,0.45)] sm:p-7">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-blue-600 p-2 text-white shadow-md">
                    <Activity size={18} className="animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold">History Terbaru</h3>
                </div>
                <span
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                    live ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400" : "border-slate-600 bg-slate-700/50 text-slate-400"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${live ? "animate-ping bg-emerald-400" : "bg-slate-500"}`} /> {live ? "Live" : "Terputus"}
                </span>
              </div>
              <p className="mb-4 text-xs text-slate-400">Catatan pelanggaran terbaru, diperbarui otomatis tiap 15 detik.</p>
              <div className="space-y-3">
                {pel.recent.length === 0 && <p className="text-xs text-slate-400">Belum ada catatan.</p>}
                {pel.recent.map((r, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-3 shadow-sm transition-all hover:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">{r.nama}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={10} /> {r.time}
                      </span>
                    </div>
                    <p className="truncate text-xs font-medium text-slate-300">{r.aksi}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* C. Grafik Pareto */}
        <div className={panel}>
          <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-400">Grafik Pareto Pelanggaran</h3>
          {pareto.length === 0 && <p className="text-sm text-slate-400">Belum ada pelanggaran yang tercatat.</p>}
          <div className="space-y-5">
            {pareto.map((s) => (
              <div key={s.nama} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span
                    className="inline-block w-fit cursor-pointer truncate font-semibold text-slate-700 transition-colors hover:text-blue-600"
                    onMouseEnter={show(s)}
                    onMouseLeave={hide}
                  >
                    {s.short}
                  </span>
                  <span className="max-w-[60%] shrink-0 truncate rounded-full border border-blue-200 bg-blue-100/70 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                    {s.jumlah} Poin ({s.kategori})
                  </span>
                </div>
                <div className="py-1">
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-200/90 p-0.5 shadow-inner">
                    <div
                      className="h-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 shadow-sm transition-all duration-1000 hover:brightness-110"
                      style={{ width: `${(s.jumlah / max) * 100}%` }}
                      onMouseEnter={show(s)}
                      onMouseLeave={hide}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* D. Daftar nama siswa */}
        <div className={panel}>
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <Users size={16} className="text-blue-600" /> Daftar Nama Siswa
            </h3>
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau kategori..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-10 text-xs font-medium text-slate-800 shadow-xs transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Hapus pencarian">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="custom-scrollbar mt-4 grid max-h-[560px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
              {filtered.map((s, i) => (
                <div
                  key={s.nama}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-blue-100/60 bg-white/70 backdrop-blur-md p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.14)] transition-all hover:border-blue-300"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/30">{i + 1}</span>
                    <span className="inline-block cursor-pointer truncate text-sm font-semibold text-slate-800 transition-colors hover:text-blue-600" onMouseEnter={show(s)} onMouseLeave={hide}>
                      {s.nama}
                    </span>
                  </div>
                  <span
                    className={`max-w-[45%] shrink-0 cursor-pointer truncate rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                      s.jumlah ? "border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100" : "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                    onMouseEnter={show(s)}
                    onMouseLeave={hide}
                  >
                    {s.jumlah ? s.kategori : "Bersih"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">
              Tidak ada nama siswa yang cocok dengan kata kunci &quot;<span className="font-semibold text-slate-600">{query}</span>&quot;.
            </div>
          )}

          <div className="mt-8 border-t border-slate-200 pt-4 text-center">
            <span className="text-xs font-medium text-slate-400">Arahkan kursor ke nama atau label biru untuk melihat detail pelanggaran.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Halaman */

export default function HomeDashboard({ data }: { data: HomeData }) {
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

  return (
    <div className="relative min-h-screen overflow-x-clip text-slate-900 selection:bg-blue-100">
      <Hero slides={data.slides} />
      <NavIsland variant="floating" />

      <div className="mx-auto max-w-6xl space-y-12 px-4 pb-32 pt-8 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Total Pelanggaran", value: pel.total, icon: AlertTriangle, tone: "bg-rose-50 text-rose-600 border-rose-200" },
            { label: "Total Izin Sakit", value: stats.totalSakit, icon: Stethoscope, tone: "bg-amber-50 text-amber-600 border-amber-200" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-md p-6 shadow-[0_22px_50px_rgba(15,23,42,0.22)] transition-shadow hover:shadow-[0_26px_60px_rgba(15,23,42,0.3)] sm:p-7">
              <div>
                <p className="text-base font-semibold text-slate-600 sm:text-lg">{label}</p>
                <p className="mt-1 text-5xl font-extrabold text-blue-600">{value}</p>
              </div>
              <div className={`rounded-2xl border p-4 shadow-md ${tone}`}>
                <Icon size={28} />
              </div>
            </div>
          ))}
        </div>

        <HomeCards cards={data.cards} />

        <LogPanel logs={data.logs} />
        <OrgChart org={data.org} />
        <PieSection pel={pel} />
        <DashboardSection pel={pel} live={live} />
        <HelpFooter />
      </div>
    </div>
  );
}
