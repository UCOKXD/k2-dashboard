import SeatPlanner from "@/components/SeatPlanner";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;

export default async function Page() {
  const seats = await getContent("seats");
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tempat Duduk</h2>
      <p className="rounded-lg bg-amber-100/90 px-4 py-2 text-center text-sm font-bold shadow-sm">! JANGAN LUPA TAP IN &amp; TAP OUT !</p>
      <SeatPlanner initial={seats} />
    </div>
  );
}
