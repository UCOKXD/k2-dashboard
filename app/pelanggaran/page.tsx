import { getTable } from "@/lib/sheets";
import { buildPelanggaran, pelRows } from "@/lib/dashboard";
import { getContent } from "@/lib/content-server";
import DataTable from "@/components/DataTable";
import AdminLink from "@/components/AdminLink";
import PelStats from "@/components/PelStats";
import { pelStats } from "@/lib/pel-stats";
import PageHero from "@/components/PageHero";
import Avatar from "@/components/Avatar";
import SectionHead from "@/components/SectionHead";

export const revalidate = 30;
export const metadata = { title: "Pelanggaran | K2 PPTI 28" };

export default async function Page() {
  const [t, ov] = await Promise.all([getTable("pelanggaran"), getContent("pelanggaran")]);
  const pel = buildPelanggaran(t, ov);
  const rows = pelRows(t, ov).filter((r) => !r.hidden).reverse(); // terbaru dulu
  const stats = pelStats(rows);

  return (
    <>
      <PageHero
        eyebrow="Kedisiplinan"
        title="Pelanggaran"
        lede="Catatan kedisiplinan kelas ABSORBING, diperbarui oleh Divisi K2."
        sticker="cari-info"
        actions={<AdminLink href="/admin?tab=pelanggaran" label="Kelola pelanggaran" perm="pelanggaran" />}
      />
      <div className="space-y-12 py-[clamp(32px,5vw,56px)]">
        <section>
          <SectionHead no="01" label="Ringkasan" title="Angka pelanggaran" />
          <PelStats stats={stats} />
        </section>

        {pel.shame.length > 0 && (
          <section className="rounded-k2-lg border border-bad/35 bg-bad-soft p-5 shadow-2">
            <h3 className="mb-4 text-lg font-bold text-red-700">Hall of Shame</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {pel.shame.map((r, i) => (
                <div key={r.nama} className="rounded-xl border-2 border-dashed border-red-400 bg-amber-50 p-4 text-center shadow transition-transform hover:-rotate-1 hover:scale-105">
                  <p className="font-mono text-sm font-bold text-red-600">#{i + 1}</p>
                  <Avatar nama={r.nama} className="mx-auto mt-2 h-20 w-20 text-2xl ring-4 ring-red-200" />
                  <p className="my-2 text-lg font-extrabold">{r.nama}</p>
                  <p className="font-display text-3xl font-black text-red-600">
                    {r.jumlah} <span className="font-sans text-sm font-semibold">poin</span>
                  </p>
                  <p className="text-xs text-red-500">{r.kasus} pelanggaran</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHead no="02" label="Rekap" title="Per siswa" />
          <DataTable
            label="rekap per siswa"
            cols={[
              { key: "nama", label: "Nama" },
              { key: "kasus", label: "Jumlah pelanggaran" },
              { key: "poin", label: "Total poin" },
            ]}
            rows={pel.students.map((r) => ({ nama: r.nama, kasus: String(r.kasus), poin: String(r.jumlah) }))}
          />
        </section>

        <section>
          <SectionHead no="03" label="Detail" title="Riwayat laporan" />
          <DataTable
            label="riwayat laporan"
            cols={[
              { key: "tanggal", label: "Tanggal" },
              { key: "nama", label: "Nama" },
              { key: "kat", label: "Jenis pelanggaran" },
              { key: "ket", label: "Keterangan" },
              { key: "poin", label: "Poin" },
            ]}
            rows={rows.map((r) => ({ tanggal: r.tanggal, nama: r.nama, kat: r.kat, ket: r.ket, poin: String(r.poin) }))}
          />
        </section>
      </div>
    </>
  );
}
