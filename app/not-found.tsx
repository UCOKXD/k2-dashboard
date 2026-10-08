import Link from "next/link";
import Sticker from "@/components/Sticker";

export const metadata = { title: "Halaman tidak ditemukan | K2 PPTI 28" };

const LINKS = [
  { href: "/jadwal", label: "Jadwal" },
  { href: "/izin", label: "Izin" },
  { href: "/pelanggaran", label: "Pelanggaran" },
];

// Halaman 404: dipakai untuk alamat yang tidak ada. Header & menu sudah dari <Shell>.
export default function NotFound() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 py-6 sm:gap-14 sm:py-12">
      <Sticker name="nyasar" size={300} />
      <div className="flex max-w-[520px] flex-[0_1_520px] flex-col gap-4">
        <p className="font-mono text-8xl font-black leading-none tracking-tight text-navy-900">404</p>
        <h1 className="text-3xl font-extrabold text-slate-800">Halaman ini tidak ditemukan</h1>
        <p className="text-base text-slate-600">
          Mungkin alamatnya salah ketik, atau halamannya sudah dipindah. Coba kembali ke beranda atau pilih salah satu halaman di bawah.
        </p>
        <div className="mt-2 flex flex-wrap gap-2.5">
          <Link href="/" className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(11,30,61,0.35)] transition hover:bg-navy-800">
            Kembali ke beranda
          </Link>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-slate-500">Masih nyasar? Kabari Koordinator K2 halaman mana yang kamu cari.</p>
      </div>
    </div>
  );
}
