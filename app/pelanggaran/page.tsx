import { getTable } from "@/lib/sheets";
import { buildPelanggaran, pelRows } from "@/lib/dashboard";
import { getContent } from "@/lib/content-server";
import DataTable from "@/components/DataTable";
import AdminLink from "@/components/AdminLink";

export const revalidate = 30;

export default async function Page() {
  const [t, ov] = await Promise.all([getTable("pelanggaran"), getContent("pelanggaran")]);
  const pel = buildPelanggaran(t, ov);
  const rows = pelRows(t, ov).filter((r) => !r.hidden).reverse(); // terbaru dulu

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Pelanggaran</h2>
        <AdminLink href="/admin?tab=pelanggaran" label="Kelola pelanggaran" />
      </div>

      {pel.shame.length > 0 && (
        <section className="rounded-2xl border-2 border-red-300 bg-red-50/80 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <h3 className="mb-4 text-lg font-bold text-red-700">Hall of Shame</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {pel.shame.map((r, i) => (
              <div key={r.nama} className="rounded-xl border-2 border-dashed border-red-400 bg-amber-50 p-4 text-center shadow transition-transform hover:-rotate-1 hover:scale-105">
                <p className="text-sm font-bold text-red-600">Dicari #{i + 1}</p>
                <p className="my-2 text-lg font-extrabold">{r.nama}</p>
                <p className="text-3xl font-black text-red-600">
                  {r.jumlah} <span className="text-sm font-semibold">poin</span>
                </p>
                <p className="text-xs text-red-500">{r.kasus} pelanggaran</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <DataTable
        head="bg-navy-900 text-white"
        cols={[
          { key: "nama", label: "Nama" },
          { key: "kasus", label: "Jumlah pelanggaran" },
          { key: "poin", label: "Total poin" },
        ]}
        rows={pel.students.map((r) => ({ nama: r.nama, kasus: String(r.kasus), poin: String(r.jumlah) }))}
      />

      <h3 className="pt-4 text-lg font-bold">Riwayat laporan</h3>
      <DataTable
        head="bg-sea-100 text-navy-900"
        cols={[
          { key: "tanggal", label: "Tanggal" },
          { key: "nama", label: "Nama" },
          { key: "kat", label: "Jenis pelanggaran" },
          { key: "ket", label: "Keterangan" },
          { key: "poin", label: "Poin" },
        ]}
        rows={rows.map((r) => ({ tanggal: r.tanggal, nama: r.nama, kat: r.kat, ket: r.ket, poin: String(r.poin) }))}
      />
    </div>
  );
}
