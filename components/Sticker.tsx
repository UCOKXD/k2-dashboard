"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { STICKERS, type StickerName } from "@/lib/stickers";

// Tinggi render di layar lebar (px). Di ponsel dikecilkan sekitar 65%.
const SIZE = {
  110: "h-[72px] sm:h-[110px]",
  120: "h-[78px] sm:h-[120px]",
  130: "h-[84px] sm:h-[130px]",
  150: "h-[98px] sm:h-[150px]",
  170: "h-[110px] sm:h-[170px]",
  200: "h-[130px] sm:h-[200px]",
  210: "h-[136px] sm:h-[210px]",
  220: "h-[144px] sm:h-[220px]",
  300: "h-[196px] sm:h-[300px]",
} as const;

// Stiker maskot interaktif: timbul + bayangan saat disorot, bergoyang saat diklik.
// `sound` (opsional, mis. "/sounds/xxx.mp3") diputar saat diklik — disiapkan untuk easter egg nanti.
// Hanya stiker tanpa tulisan (balon) yang boleh dicerminkan, supaya tulisannya tidak terbalik.
export default function Sticker({
  name,
  size,
  className = "",
  sound,
  mirror = false,
}: {
  name: StickerName;
  size: keyof typeof SIZE;
  className?: string;
  sound?: string;
  mirror?: boolean;
}) {
  const s = STICKERS[name];
  const flip = mirror && name.startsWith("maskot-balon");
  const [wiggle, setWiggle] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);

  function poke() {
    setWiggle((n) => n + 1);
    if (sound) {
      try {
        audio.current ??= new Audio(sound);
        audio.current.currentTime = 0;
        void audio.current.play();
      } catch {}
    }
  }

  return (
    <button
      type="button"
      onClick={poke}
      aria-label={s.alt}
      className={`group block shrink-0 cursor-pointer select-none rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-sea-500 focus-visible:ring-offset-2 ${SIZE[size]} ${className}`}
    >
      <span className={`block h-full ${flip ? "-scale-x-100" : ""}`}>
        <Image
          key={wiggle}
          src={`/stickers/sticker-${name}.png`}
          alt=""
          width={s.w}
          height={s.h}
          draggable={false}
          className={`k2-sticker h-full w-auto max-w-none drop-shadow-[0_8px_10px_rgba(15,23,42,0.35)] transition duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:drop-shadow-[0_16px_18px_rgba(15,23,42,0.4)] ${
            wiggle ? "animate-wiggle" : ""
          }`}
        />
      </span>
    </button>
  );
}
