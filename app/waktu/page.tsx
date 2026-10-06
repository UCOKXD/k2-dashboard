import TimeClock from "@/components/TimeClock";
import TimerTools from "@/components/TimerTools";

export const metadata = { title: "Waktu | K2 PPTI 28" };

export default function Page() {
  return (
    <div className="space-y-6">
      <TimeClock />
      <TimerTools />
    </div>
  );
}
