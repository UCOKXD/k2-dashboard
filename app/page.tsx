import HomeDashboard from "@/components/HomeDashboard";
import { buildLogs, buildPelanggaran } from "@/lib/dashboard";
import { getTable } from "@/lib/sheets";
import { recentDoaPicks } from "@/lib/store";

export const revalidate = 30;

export default async function Home() {
  const [pel, sakit, izin, acara, doa] = await Promise.all([
    getTable("pelanggaran"),
    getTable("sakit"),
    getTable("izin"),
    getTable("acara"),
    recentDoaPicks(),
  ]);

  return (
    <HomeDashboard
      data={{
        stats: { totalSakit: sakit.rows.length },
        pelanggaran: buildPelanggaran(pel),
        logs: buildLogs({ pelanggaran: pel, sakit, izin, acara }, doa),
      }}
    />
  );
}
