import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";
import IzinStats from "@/components/IzinStats";
import ContactK2 from "@/components/ContactK2";
import PageHero from "@/components/PageHero";
import SectionHead from "@/components/SectionHead";
import { izinStats } from "@/lib/izin-stats";

export const revalidate = 30;
export const metadata = { title: "Izin | K2 PPTI 28" };

export default async function Page() {
  const t = await getTable("izin");
  const stats = izinStats(t, /jenis|tipe|kategori|izin|keperluan/i, "Jenis izin terbanyak");
  return (
    <>
      <PageHero
        eyebrow="Izin"
        title="Izin"
        lede="Izin tidak hadir, terlambat, dan pulang lebih awal. Datanya diambil dari spreadsheet Divisi K2."
        sticker="tanya-k2"
      />
      <div className="space-y-12 py-[clamp(32px,5vw,56px)]">
        <ContactK2 text="Mau izin tidak hadir, telat, atau pulang lebih awal? Kabari Divisi K2 lewat WhatsApp." />
        <section>
          <SectionHead no="01" label="Ringkasan" title="Angka izin" />
          <IzinStats stats={stats} unit="izin" />
        </section>
        <section>
          <SectionHead no="02" label="Data" title="Daftar izin" />
          <DataTable cols={t.cols} rows={t.rows} emptySticker label="daftar izin" />
        </section>
      </div>
    </>
  );
}
