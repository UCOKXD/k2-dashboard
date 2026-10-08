// Daftar stiker maskot K2 (public/stickers). Ukuran = ukuran asli PNG, dipakai next/image untuk rasio.
// `alt` = tulisan di stiker; dibacakan pembaca layar. Stiker tanpa tulisan (berenang, balon) boleh dicerminkan.
export const STICKERS = {
  halo: { w: 206, h: 195, alt: "Maskot K2: Halo!" },
  "tanya-k2": { w: 158, h: 194, alt: "Maskot K2: Tanya K2?" },
  "cari-info": { w: 164, h: 194, alt: "Maskot K2: Cari info" },
  siap: { w: 167, h: 201, alt: "Maskot K2: Siap!" },
  "info-penting": { w: 193, h: 204, alt: "Maskot K2: Info penting!" },
  "cek-di-sini": { w: 180, h: 202, alt: "Maskot K2: Cek di sini!" },
  "sebentar-ya": { w: 180, h: 194, alt: "Maskot K2: Sebentar ya..." },
  "belum-ada-data": { w: 190, h: 193, alt: "Maskot K2: Belum ada data" },
  waduh: { w: 177, h: 197, alt: "Maskot K2: Waduh!" },
  "waduh-error": { w: 179, h: 199, alt: "Maskot K2: Waduh!" },
  nyasar: { w: 188, h: 197, alt: "Maskot K2: Nyasar?" },
  "ayo-berdoa": { w: 168, h: 205, alt: "Maskot K2: Ayo berdoa" },
  "cepat-sembuh": { w: 168, h: 209, alt: "Maskot K2: Cepat sembuh!" },
  "jangan-telat": { w: 181, h: 208, alt: "Maskot K2: Jangan telat!" },
  deadline: { w: 174, h: 208, alt: "Maskot K2: Deadline!" },
  "selamat-ulang-tahun": { w: 195, h: 216, alt: "Maskot K2: Selamat ulang tahun!" },
  "duduk-sini": { w: 189, h: 211, alt: "Maskot K2: Duduk sini" },
  cekrek: { w: 169, h: 208, alt: "Maskot K2: Cekrek!" },
  "maskot-balon-1": { w: 263, h: 306, alt: "Maskot K2 membawa balon" },
  "maskot-balon-2": { w: 236, h: 305, alt: "Maskot K2 membawa balon" },
} as const;

export type StickerName = keyof typeof STICKERS;
