import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";

export const revalidate = 30;

export default async function Page() {
  const t = await getTable("acara");
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Kalender Acara</h2>
      <DataTable head="bg-sea-100 text-navy-900" cols={t.cols} rows={t.rows} />
      <a href="https://forms.gle/w9G7tBxWwaLBW6y59" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-30 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-sea-600">+ Saran acara</a>
    </div>
  );
}
