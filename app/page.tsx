import HomeDashboard from "@/components/HomeDashboard";
import { buildLogs, buildPelanggaran } from "@/lib/dashboard";
import { getTable, isThisMonth, isToday } from "@/lib/sheets";

export const revalidate = 30;

export default async function Home() {
  const [pel, sakit, izin, acara] = await Promise.all([
    getTable("pelanggaran"),
    getTable("sakit"),
    getTable("izin"),
    getTable("acara"),
  ]);

  return (
    <HomeDashboard
      data={{
        stats: {
          pelanggaranBulanIni: pel.rows.filter((r) => isThisMonth(r[pel.date])).length,
          sakitHariIni: sakit.rows.filter((r) => isToday(r[sakit.date])).map((r) => r[sakit.name]),
        },
        pelanggaran: buildPelanggaran(pel),
        logs: buildLogs({ pelanggaran: pel, sakit, izin, acara }),
      }}
    />
  );
}
