import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";

export const revalidate = 30;

export default async function Page() {
  const t = await getTable("sakit");
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Izin Sakit</h2>
      <DataTable head="bg-emerald-100 text-emerald-900" cols={t.cols} rows={t.rows} />
      
    </div>
  );
}
