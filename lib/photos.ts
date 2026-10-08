// Foto untuk banner beranda dan latar jam halaman Waktu.
// Kalau galeri sudah berisi, foto diambil acak dari galeri (ditambah foto banner yang diunggah admin);
// foto bawaan (foto-1/foto-2) hanya dipakai selama galeri masih kosong.
import { DEFAULT_SLIDES, type GalleryItem, type SlidesData } from "@/lib/content";

const BAWAAN = new Set<string>(DEFAULT_SLIDES.items.map((i) => i.src));
const MAX_BANNER = 8; // dibatasi supaya beranda tidak memuat terlalu banyak foto sekaligus

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pool(slides: SlidesData, gallery: GalleryItem[]) {
  const own = slides.items.map((s) => s.src).filter((src) => !BAWAAN.has(src));
  return [...new Set([...own, ...gallery.map((g) => g.src)])];
}

// Banner beranda: urutan acak dari galeri; galeri kosong = banner seperti biasa.
export function bannerSlides(slides: SlidesData, gallery: GalleryItem[]): SlidesData {
  if (!gallery.length) return slides;
  const items = shuffle(pool(slides, gallery))
    .slice(0, MAX_BANNER)
    .map((src, i) => ({ id: `acak-${i}`, src }));
  return { ...slides, items };
}

// Latar jam halaman Waktu: daftar foto acak dari galeri yang bergantian otomatis; galeri kosong = foto-2.
export function clockPhotos(slides: SlidesData, gallery: GalleryItem[]): string[] {
  if (!gallery.length) return ["/slides/foto-2.jpg"];
  return shuffle(pool(slides, gallery)).slice(0, 12);
}
