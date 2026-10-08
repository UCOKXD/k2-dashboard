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
    // Beranda tidak memberi jarak atas (banner-nya penuh), jadi jaraknya ditambah di sini.
    <div className={`flex flex-wrap items-center justify-center gap-8 py-6 sm:gap-14 sm:py-12 ${path === "/" ? "px-4 pt-32 lg:pt-28" : ""}`}>
      <Sticker name="waduh-error" size={300} />
      <div className="flex max-w-[520px] flex-[0_1_520px] flex-col gap-4">
        <span className="self-start rounded-full bg-rose-50 px-3 py-1 text-[13px] font-bold text-rose-700">Gagal memuat data</span>
        <h1 className="text-3xl font-extrabold text-slate-800">Ada yang putus di tengah jalan</h1>
        <p className="text-base text-slate-600">Website belum bisa mengambil data dari server atau spreadsheet. Biasanya ini sebentar saja, coba muat ulang dalam beberapa detik.</p>
        <div className="mt-2 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => retry()}
            className="flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(11,30,61,0.35)] transition hover:bg-navy-800"
          >
            <RefreshCw size={15} /> Coba lagi
          </button>
          <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Kembali ke beranda
          </Link>
        </div>
        <details className="mt-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-md">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">Detail untuk admin</summary>
          <div className="mt-2 space-y-1.5 font-mono text-xs leading-relaxed text-slate-600">
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
