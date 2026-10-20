import SeatPlanner from "@/components/SeatPlanner";
import TapReminder from "@/components/TapReminder";
import PageHero from "@/components/PageHero";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;
export const metadata = { title: "Tempat Duduk | K2 PPTI 28" };

export default async function Page() {
  const seats = await getContent("seats");
  return (
    <>
      <PageHero eyebrow="Tempat duduk" title="Tempat Duduk" lede="Denah tempat duduk kelas ABSORBING yang diatur Divisi K2." sticker="duduk-sini" />
      <div className="space-y-6 py-[clamp(32px,5vw,56px)]">
        <TapReminder />
        <SeatPlanner initial={seats} />
      </div>
    </>
  );
}
