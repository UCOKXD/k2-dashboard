import DoaRandomizer from "@/components/DoaRandomizer";
import PageHero from "@/components/PageHero";
import { STUDENTS } from "@/lib/students";

export const metadata = { title: "Doa Harian | K2 PPTI 28" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Doa harian" title="Doa Harian" lede="Petugas doa dipilih acak setiap hari." sticker="ayo-berdoa" />
      <div className="py-[clamp(32px,5vw,56px)]">
        <DoaRandomizer names={STUDENTS.map((s) => s.full)} />
      </div>
    </>
  );
}
