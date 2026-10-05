import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";

export const revalidate = 30;

export default async function Page() {
  const t = await getTable("izin");
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Izin Tidak Hadir / Telat / Pulang Lebih Awal</h2>
      <DataTable head="bg-yellow-100 text-yellow-900" cols={t.cols} rows={t.rows} />
      
    </div>
  );
}
