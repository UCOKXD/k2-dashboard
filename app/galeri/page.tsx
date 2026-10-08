import AdminLink from "@/components/AdminLink";
import GalleryView from "@/components/GalleryView";
import Sticker from "@/components/Sticker";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;
export const metadata = { title: "Galeri Kelas | K2 PPTI 28" };

export default async function Page() {
  const gallery = await getContent("gallery");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Galeri Kelas</h2>
        <div className="flex items-center gap-3">
          <AdminLink href="/admin?tab=galeri" label="Unggah foto" />
          {/* Saat galeri kosong, maskot "Belum ada data" yang tampil di bawah, jadi yang ini disembunyikan. */}
          {gallery.length > 0 && <Sticker name="cekrek" size={150} />}
        </div>
      </div>
      <GalleryView items={gallery} />
    </div>
  );
}
