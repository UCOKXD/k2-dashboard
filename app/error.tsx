"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import Sticker from "@/components/Sticker";

const waktu = () =>
  new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

// Tampil kalau data gagal dimuat (server/spreadsheet). Header & menu sudah dari <Shell>.
// `retry` = muat ulang data dari server lalu tampilkan ulang halamannya (Next.js 16.3+).
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const path = usePathname();
  const [at] = useState(waktu);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // Beranda tidak memberi jarak atas (sampulnya penuh), jadi jaraknya ditambah di sini.
    <div className={`grid min-h-[calc(100vh-64px-220px)] items-center gap-[clamp(28px,6vw,72px)] py-14 min-[761px]:grid-cols-[auto_1fr] ${path === "/" ? "mx-auto max-w-[calc(var(--wadah)+var(--gutter)*2)] px-[var(--gutter)] pt-32 lg:pt-28" : ""}`}>
      <Sticker name="waduh-error" size={300} />
      <div className="max-w-[560px]">
        <span className="inline-flex rounded-full bg-bad-soft px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.08em] text-bad">Gagal memuat data</span>
        <h1 className="mt-3.5 text-[clamp(28px,3.6vw,42px)] font-bold">Ada yang putus di tengah jalan</h1>
        <p className="mt-3.5 max-w-[50ch] text-[17px] text-ink-3">Website belum bisa mengambil data dari server atau spreadsheet. Biasanya ini sebentar saja, coba muat ulang dalam beberapa detik.</p>
        <div className="mt-[26px] flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0b1e3d] px-5 text-[15px] font-semibold text-white transition hover:bg-[#1b3a6b] dark:bg-[#2e9be0] dark:text-[#061227] dark:hover:bg-[#8fcff1]"
          >
            <RefreshCw size={16} /> Coba lagi
          </button>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 text-[15px] font-semibold text-ink transition hover:border-ink-3">
            Kembali ke beranda
          </Link>
        </div>
        <details className="mt-6 max-w-[520px] rounded-k2-md border border-line bg-surface px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink-2">Detail untuk admin</summary>
          <div className="mt-2.5 space-y-1.5 font-mono text-[12.5px] leading-relaxed text-ink-3">
            <p className="break-words">{error.message || "Tidak ada pesan error."}</p>
            <p>
              {error.digest ? `Kode: ${error.digest} · ` : ""}Waktu: {at} · Halaman: {path}
            </p>
            <p>Cek SHEET_ID, GOOGLE_API_KEY, nama tab, dan pastikan sheet dibagikan sebagai &quot;Anyone with the link: Viewer&quot;.</p>
          </div>
        </details>
      </div>
    </div>
  );
}
