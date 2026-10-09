import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";
import IzinStats from "@/components/IzinStats";
import ContactK2 from "@/components/ContactK2";
import { izinStats } from "@/lib/izin-stats";

export const revalidate = 30;

export default async function Page() {
  const t = await getTable("izin");
  const stats = izinStats(t, /jenis|tipe|kategori|izin|keperluan/i, "Jenis izin terbanyak");
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Izin Tidak Hadir / Telat / Pulang Lebih Awal</h2>
      <ContactK2 text="Mau izin tidak hadir, telat, atau pulang lebih awal? Kabari Divisi K2 lewat WhatsApp." />
      <IzinStats stats={stats} accent="bg-amber-500" unit="izin" />
      <h3 className="pt-2 text-lg font-bold">Daftar izin</h3>
      <DataTable head="bg-yellow-100 text-yellow-900" cols={t.cols} rows={t.rows} emptySticker />
    </div>
  );
}
