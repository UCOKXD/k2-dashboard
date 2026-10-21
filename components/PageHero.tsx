import Sticker from "@/components/Sticker";
import { BirthdayStrip } from "@/components/Birthday";
import type { StickerName } from "@/lib/stickers";

// Kepala halaman biru (desain v2) untuk semua halaman publik selain beranda.
// Menu pulau mengapung di atasnya; saat tema ulang tahun, strip ajakan tampil tepat di bawahnya.
export default function PageHero({
  eyebrow,
  title,
  lede,
  sticker,
  actions,
  aside,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  sticker?: StickerName;
  actions?: React.ReactNode;
  aside?: React.ReactNode; // isi kanan (mis. pilihan CAWU), menggantikan stiker
}) {
  return (
    <>
      <section className="k2-page-hero">
        <div className="k2-page-hero__in">
          <div className="min-w-0">
            <p className="k2-eyebrow">K2 · {eyebrow}</p>
            <h1>{title}</h1>
            {lede && <p className="k2-page-hero__lede">{lede}</p>}
            {actions && <div className="mt-5 flex flex-wrap items-center gap-2.5">{actions}</div>}
          </div>
          {aside ? <div className="self-end">{aside}</div> : sticker && <Sticker name={sticker} size={150} className="k2-page-hero__host" />}
        </div>
      </section>
      <div className="mt-6 empty:hidden">
        <BirthdayStrip />
      </div>
    </>
  );
}
