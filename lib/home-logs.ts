// Log Aktivitas lengkap (Google Form + perubahan admin + acak doa). Hanya untuk server.
import { buildLogs, pelRows } from "@/lib/dashboard";
import { getActivity, getContent } from "@/lib/content-server";
import { getTable } from "@/lib/sheets";
import { recentDoaPicks } from "@/lib/store";

export async function homeLogs() {
  const [pel, sakit, izin, acara, doa, ov, activity] = await Promise.all([
    getTable("pelanggaran"),
    getTable("sakit"),
    getTable("izin"),
    getTable("acara"),
    recentDoaPicks(),
    getContent("pelanggaran"),
    getActivity(),
  ]);
  return buildLogs({ pelanggaran: pelRows(pel, ov), sakit, izin, acara }, doa, activity);
}
