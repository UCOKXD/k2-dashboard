import { getTable } from "@/lib/sheets";
import { countBy } from "@/lib/students";
import DataTable from "@/components/DataTable";

export const revalidate = 30;

export default async function Page() {
  const t = await getTable("pelanggaran");
  const ranking = countBy(t.rows.map((r) => r[t.name])); // terbanyak -> 0
  const top = ranking.filter((r) => r.jumlah > 0).slice(0, 3);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pelanggaran</h2>

      {top.length > 0 && (
        <section className="rounded-2xl border-2 border-red-300 bg-red-50 p-5">
          <h3 className="mb-4 text-lg font-bold text-red-700">Wall of Shame</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {top.map((r, i) => (
              <div key={i} className="rounded-xl border-2 border-dashed border-red-400 bg-amber-50 p-4 text-center shadow transition-transform hover:-rotate-1 hover:scale-105">
                <p className="text-sm font-bold text-red-600">Dicari #{i + 1}</p>
                <p className="my-2 text-lg font-extrabold">{r.nama}</p>
                <p className="text-3xl font-black text-red-600">
                  {r.jumlah} <span className="text-sm font-semibold">pelanggaran</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <DataTable
        head="bg-navy-900 text-white"
        cols={[{ key: "nama", label: "Nama" }, { key: "jumlah", label: "Jumlah pelanggaran" }]}
        rows={ranking.map((r) => ({ nama: r.nama, jumlah: String(r.jumlah) }))}
      />

      <h3 className="pt-4 text-lg font-bold">Riwayat laporan</h3>
      <DataTable head="bg-sea-100 text-navy-900" cols={t.cols} rows={t.rows} />
    </div>
  );
}
