import AdminLink from "@/components/AdminLink";
import GalleryView from "@/components/GalleryView";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;
export const metadata = { title: "Galeri Kelas | K2 PPTI 28" };

export default async function Page() {
  const gallery = await getContent("gallery");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Galeri Kelas</h2>
        <AdminLink href="/admin?tab=galeri" label="Unggah foto" />
      </div>
      <GalleryView items={gallery} />
    </div>
  );
}
