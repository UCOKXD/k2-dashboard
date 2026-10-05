import AdminLink from "@/components/AdminLink";
import ScheduleView from "@/components/ScheduleView";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;
export const metadata = { title: "Jadwal Kuliah | K2 PPTI 28" };

export default async function Page() {
  const schedule = await getContent("schedule");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Jadwal Kuliah</h2>
        <AdminLink href="/admin?tab=jadwal" label="Ubah jadwal" />
      </div>
      <ScheduleView schedule={schedule} />
    </div>
  );
}
