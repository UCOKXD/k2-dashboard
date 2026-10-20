import TimeClock from "@/components/TimeClock";
import TimerTools from "@/components/TimerTools";
import { getContent } from "@/lib/content-server";
import { galleryPhotos } from "@/lib/photos";

export const metadata = { title: "Waktu | K2 PPTI 28" };
export const revalidate = 30; // foto latar jam diacak ulang dari galeri

// Tanpa kepala halaman: judul "Waktu Real-time" sengaja dihapus atas permintaan pemilik; panel jam jadi sampulnya.
export default async function Page() {
  const gallery = await getContent("gallery");
  return (
    <div className="space-y-12">
      <TimeClock photos={galleryPhotos(gallery)} />
      <TimerTools />
    </div>
  );
}
