import DoaRandomizer from "@/components/DoaRandomizer";
import { STUDENTS } from "@/lib/students";

export default function Page() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Doa Harian</h2>
      <DoaRandomizer names={STUDENTS.map((s) => s.full)} />
    </div>
  );
}
