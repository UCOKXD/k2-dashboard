import PageHero from "@/components/PageHero";
import ProfileDirectory from "@/components/ProfileDirectory";

export const metadata = { title: "Profil Kelas | K2 PPTI 28" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Profil" title="Teman Sekelas" lede="Profil 34 siswa ABSORBING: foto, bio, Instagram, dan catatan izin serta pelanggaran." />
      <div className="py-[clamp(32px,5vw,56px)]">
        <ProfileDirectory />
      </div>
    </>
  );
}
