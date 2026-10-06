"use client";
import Image from "next/image";
import { useRef, useState } from "react";

// Stiker dekorasi interaktif: timbul + bayangan saat disorot, bergoyang saat diklik.
// `sound` (opsional, mis. "/sounds/xxx.mp3") diputar saat diklik — disiapkan untuk easter egg nanti.
export default function Sticker({
  src,
  alt,
  width,
  height,
  className = "",
  sound,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sound?: string;
}) {
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
    <button type="button" onClick={poke} aria-label={alt} className={`group shrink-0 cursor-pointer select-none ${className}`}>
      <Image
        key={wiggle}
        src={src}
        alt=""
        width={width}
        height={height}
        draggable={false}
        className={`h-auto w-full drop-shadow-[0_8px_10px_rgba(15,23,42,0.35)] transition duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:drop-shadow-[0_16px_18px_rgba(15,23,42,0.4)] ${
          wiggle ? "animate-wiggle" : ""
        }`}
      />
    </button>
  );
}
