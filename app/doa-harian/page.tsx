import DoaRandomizer from "@/components/DoaRandomizer";
import Sticker from "@/components/Sticker";
import { STUDENTS } from "@/lib/students";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Doa Harian</h2>
        <Sticker name="ayo-berdoa" size={150} />
      </div>
      <DoaRandomizer names={STUDENTS.map((s) => s.full)} />
    </div>
  );
}
