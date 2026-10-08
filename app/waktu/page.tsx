import TimeClock from "@/components/TimeClock";
import TimerTools from "@/components/TimerTools";
import { getContent } from "@/lib/content-server";
import { clockPhotos } from "@/lib/photos";

export const metadata = { title: "Waktu | K2 PPTI 28" };
export const revalidate = 30; // foto latar jam diacak ulang dari galeri

export default async function Page() {
  const [slides, gallery] = await Promise.all([getContent("slides"), getContent("gallery")]);
  return (
    <div className="space-y-6">
      <TimeClock photos={clockPhotos(slides, gallery)} />
      <TimerTools />
    </div>
  );
}
