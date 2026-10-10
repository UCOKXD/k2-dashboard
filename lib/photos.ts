// Foto untuk banner beranda dan latar jam halaman Waktu: semuanya diambil dari Galeri.
// Galeri kosong = tidak ada foto (banner & jam tampil polos, tanpa foto bawaan).
import type { GalleryItem } from "@/lib/content";

export const PHOTO_EVERY_MS = 6_000; // banner & jam berganti foto setiap 6 detik
export const MAX_PHOTOS = 12; // dibatasi supaya halaman tidak memuat terlalu banyak foto sekaligus

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Daftar foto acak dari Galeri (dipakai banner beranda dan latar jam).
export function galleryPhotos(gallery: GalleryItem[]): string[] {
  return shuffle([...new Set(gallery.map((g) => g.src))]).slice(0, MAX_PHOTOS);
}
