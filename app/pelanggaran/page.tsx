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
          <SectionHead label="Ringkasan" title="Angka pelanggaran" />
          <PelStats stats={stats} />
        </section>

        {pel.shame.length > 0 && (
          <section aria-labelledby="judul-hos">
            <SectionHead label="Peringkat" title="Hall of Shame" id="judul-hos" />
            {/* Peringkat 1 lebih besar (fokus), 2 dan 3 di sampingnya. */}
            <ol className="grid gap-4 sm:grid-cols-[1.3fr_1fr_1fr]">
              {pel.shame.map((r, i) => (
                <li key={r.nama} className={`k2-card flex flex-col items-center p-5 text-center ${i === 0 ? "border-bad/40 sm:py-7" : ""}`}>
                  <p className="font-display text-lg font-extrabold text-bad">Peringkat {i + 1}</p>
                  <Avatar nama={r.nama} className={`mt-3 ${i === 0 ? "h-24 w-24 text-3xl" : "h-16 w-16 text-xl"}`} />
                  <p className="mt-3 font-bold text-ink">{r.nama}</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-bad">
                    {r.jumlah} <span className="font-sans text-sm font-semibold">poin</span>
                  </p>
                  <p className="text-sm text-ink-3">{r.kasus} pelanggaran</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section>
          <SectionHead label="Rekap" title="Per siswa" />
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
          <SectionHead label="Detail" title="Riwayat laporan" />
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
