import TimeClock from "@/components/TimeClock";
import TimerTools from "@/components/TimerTools";

export const metadata = { title: "Waktu Real-time | K2 PPTI 28" };

export default function Page() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Waktu Real-time</h2>
      <TimeClock />
      <TimerTools />
    </div>
  );
}
