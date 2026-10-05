import SeatPlanner from "@/components/SeatPlanner";

export default function Page() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tempat Duduk</h2>
      <p className="rounded-lg bg-amber-100 px-4 py-2 text-center text-sm font-bold">! JANGAN LUPA TAP IN & TAP OUT !</p>
      <SeatPlanner />
    </div>
  );
}
