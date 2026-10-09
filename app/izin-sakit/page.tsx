import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";
import IzinStats from "@/components/IzinStats";
import Sticker from "@/components/Sticker";
import ContactK2 from "@/components/ContactK2";
import { izinStats } from "@/lib/izin-stats";

export const revalidate = 30;

export default async function Page() {
  const t = await getTable("sakit");
  const stats = izinStats(t, /keluhan|sakit|gejala|alasan|keterangan|penyakit/i, "Keluhan terbanyak");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Izin Sakit</h2>
        <Sticker name="cepat-sembuh" size={150} />
      </div>
      <ContactK2 text="Sakit dan perlu izin, atau ada pertanyaan? Kabari Divisi K2 lewat WhatsApp." />
      <IzinStats stats={stats} accent="bg-emerald-500" unit="izin sakit" />
      <h3 className="pt-2 text-lg font-bold">Daftar izin sakit</h3>
      <DataTable head="bg-emerald-100 text-emerald-900" cols={t.cols} rows={t.rows} />
    </div>
  );
}
