import SeatPlanner from "@/components/SeatPlanner";
import TapReminder from "@/components/TapReminder";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;

export default async function Page() {
  const seats = await getContent("seats");
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tempat Duduk</h2>
      <TapReminder />
      <SeatPlanner initial={seats} />
    </div>
  );
}
