import PageHero from "@/components/PageHero";
import VoiceRecorder from "@/components/VoiceRecorder";

export const metadata = { title: "Rekam Suara | K2 PPTI 28" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Rekam suara" title="Rekam Suara" lede="Rekam penjelasan dosen, lalu unduh filenya. Tidak disimpan di server." />
      <div className="py-[clamp(32px,5vw,56px)]">
        <VoiceRecorder />
      </div>
    </>
  );
}
