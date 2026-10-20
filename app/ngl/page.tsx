import NglPage from "@/components/NglPage";
import PageHero from "@/components/PageHero";

export const metadata = { title: "NGL | K2 PPTI 28" };

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="NGL kelas"
        title="NGL Kelas"
        lede="Kirim apresiasi dan masukan untuk tiap teman sekelas. Kamu bisa memilih anonim atau menampilkan panggilanmu."
      />
      <div className="py-[clamp(32px,5vw,56px)]">
        <NglPage />
      </div>
    </>
  );
}
