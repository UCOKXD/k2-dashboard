"use client";
import { useEffect } from "react";

// Satu-satunya skrip gerak halaman portofolio:
// 1. Teks [data-rakit] diberi data-masuk="1" saat cukup terlihat (huruf merakit), "0" saat keluar (huruf berserakan lagi).
// 2. Elemen [data-geser="<kecepatan>"] digeser naik-turun mengikuti scroll (parallax), lewat variabel CSS --geser.
// Jika perangkat meminta gerak dikurangi, teks langsung tampil dan parallax tidak dijalankan.
export default function Gerak() {
  useEffect(() => {
    const kurangi = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const teks = [...document.querySelectorAll<HTMLElement>("[data-rakit]")];

    if (kurangi) {
      teks.forEach((t) => (t.dataset.masuk = "1"));
      return;
    }

    const io = new IntersectionObserver(
      (entri) => entri.forEach((e) => ((e.target as HTMLElement).dataset.masuk = e.isIntersecting ? "1" : "0")),
      { threshold: 0.35 },
    );
    teks.forEach((t) => io.observe(t));

    const geser = [...document.querySelectorAll<HTMLElement>("[data-geser]")];
    let raf = 0;
    const atur = () => {
      const tinggi = window.innerHeight;
      for (const el of geser) {
        const r = el.parentElement?.getBoundingClientRect();
        if (!r || r.bottom < -tinggi || r.top > tinggi * 2) continue;
        const pusat = r.top + r.height / 2 - tinggi / 2; // jarak tengah bagian ke tengah layar
        el.style.setProperty("--geser", `${(-pusat * Number(el.dataset.geser || 0)).toFixed(1)}px`);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(atur);
    };
    atur();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return null;
}
