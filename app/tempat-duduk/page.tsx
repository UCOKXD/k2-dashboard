import SeatPlanner from "@/components/SeatPlanner";
import TapReminder from "@/components/TapReminder";
import Sticker from "@/components/Sticker";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;

export default async function Page() {
  const seats = await getContent("seats");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Tempat Duduk</h2>
        <Sticker name="duduk-sini" size={150} />
      </div>
      <TapReminder />
      <SeatPlanner initial={seats} />
    </div>
  );
}
