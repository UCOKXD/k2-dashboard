import Calculators from "@/components/Calculators";
import PageHero from "@/components/PageHero";

export const metadata = { title: "Kalkulator | K2 PPTI 28" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Kalkulator" title="Kalkulator" />
      <div className="py-[clamp(32px,5vw,56px)]">
        <Calculators />
      </div>
    </>
  );
}
