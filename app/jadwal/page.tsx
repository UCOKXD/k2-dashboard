import AdminLink from "@/components/AdminLink";
import ScheduleView from "@/components/ScheduleView";
import PageHero from "@/components/PageHero";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;
export const metadata = { title: "Jadwal Kuliah | K2 PPTI 28" };

export default async function Page() {
  const schedule = await getContent("schedule");
  return (
    <>
      {/* Saat jadwal kosong, maskot "Belum ada data" yang tampil di bawah, jadi stiker sampul disembunyikan. */}
      <PageHero
        eyebrow="Jadwal kuliah"
        title="Jadwal Kuliah"
        lede="Senin sampai Sabtu. Hari ini dan kelas yang sedang berlangsung ditandai otomatis menurut jam Jakarta."
        sticker={schedule.length > 0 ? "cek-di-sini" : undefined}
        actions={<AdminLink href="/admin?tab=jadwal" label="Ubah jadwal" perm="jadwal" />}
      />
      <div className="py-[clamp(32px,5vw,56px)]">
        <ScheduleView schedule={schedule} />
      </div>
    </>
  );
}
