import AdminLink from "@/components/AdminLink";
import GalleryView from "@/components/GalleryView";
import PageHero from "@/components/PageHero";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;
export const metadata = { title: "Galeri Kelas | K2 PPTI 28" };

export default async function Page() {
  const gallery = await getContent("gallery");
  return (
    <>
      {/* Saat galeri kosong, maskot "Belum ada data" yang tampil di bawah, jadi stiker sampul disembunyikan. */}
      <PageHero
        eyebrow="Galeri"
        title="Galeri Kelas"
        lede="Foto-foto kegiatan ABSORBING. Foto di sini juga dipakai untuk banner beranda dan latar jam."
        sticker={gallery.length > 0 ? "cekrek" : undefined}
        actions={<AdminLink href="/admin?tab=galeri" label="Unggah foto" perm="galeri" />}
      />
      <div className="py-[clamp(32px,5vw,56px)]">
        <GalleryView items={gallery} />
      </div>
    </>
  );
}
