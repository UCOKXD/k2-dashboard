import Link from "next/link";
import Sticker from "@/components/Sticker";

export const metadata = { title: "Halaman tidak ditemukan | K2 PPTI 28" };

const LINKS = [
  { href: "/jadwal", label: "Jadwal" },
  { href: "/izin", label: "Izin" },
  { href: "/pelanggaran", label: "Pelanggaran" },
];

const PRIMER = "inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0b1e3d] px-5 text-[15px] font-semibold text-white transition hover:bg-[#1b3a6b] dark:bg-[#2e9be0] dark:text-[#061227] dark:hover:bg-[#8fcff1]";
const GARIS = "inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 text-[15px] font-semibold text-ink transition hover:border-ink-3";

// Halaman 404: dipakai untuk alamat yang tidak ada. Header & menu sudah dari <Shell>.
export default function NotFound() {
  return (
    <div className="grid min-h-[calc(100vh-64px-220px)] items-center gap-[clamp(28px,6vw,72px)] py-14 min-[761px]:grid-cols-[auto_1fr]">
      <Sticker name="nyasar" size={300} />
      <div className="max-w-[560px]">
        <p className="font-display text-[clamp(80px,13vw,160px)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink" aria-hidden="true">
          4<span className="text-accent">0</span>4
        </p>
        <h1 className="mt-3.5 text-[clamp(28px,3.6vw,42px)] font-bold">Halaman ini tidak ditemukan</h1>
        <p className="mt-3.5 max-w-[50ch] text-[17px] text-ink-3">
          Mungkin alamatnya salah ketik, atau halamannya sudah dipindah. Coba kembali ke beranda atau pilih salah satu halaman di bawah.
        </p>
        <div className="mt-[26px] flex flex-wrap gap-2.5">
          <Link href="/" className={PRIMER}>
            Kembali ke beranda
          </Link>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={GARIS}>
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mt-5 text-[13px] text-ink-3">Masih nyasar? Kabari Koordinator K2 halaman mana yang kamu cari.</p>
      </div>
    </div>
  );
}
