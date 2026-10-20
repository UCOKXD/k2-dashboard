import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";
import IzinStats from "@/components/IzinStats";
import ContactK2 from "@/components/ContactK2";
import PageHero from "@/components/PageHero";
import SectionHead from "@/components/SectionHead";
import { izinStats } from "@/lib/izin-stats";

export const revalidate = 30;
export const metadata = { title: "Izin Sakit | K2 PPTI 28" };

export default async function Page() {
  const t = await getTable("sakit");
  const stats = izinStats(t, /keluhan|sakit|gejala|alasan|keterangan|penyakit/i, "Keluhan terbanyak");
  return (
    <>
      <PageHero eyebrow="Izin Sakit" title="Izin Sakit" lede="Catatan izin karena sakit dari spreadsheet Divisi K2. Semoga lekas sembuh!" sticker="cepat-sembuh" />
      <div className="space-y-12 py-[clamp(32px,5vw,56px)]">
        <ContactK2 text="Sakit dan perlu izin, atau ada pertanyaan? Kabari Divisi K2 lewat WhatsApp." />
        <section>
          <SectionHead no="01" label="Ringkasan" title="Angka izin sakit" />
          <IzinStats stats={stats} unit="izin sakit" />
        </section>
        <section>
          <SectionHead no="02" label="Data" title="Daftar izin sakit" />
          <DataTable cols={t.cols} rows={t.rows} label="daftar izin sakit" />
        </section>
      </div>
    </>
  );
}
