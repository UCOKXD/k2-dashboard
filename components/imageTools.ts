"use client";
// Kecilkan foto di browser sebelum diunggah: sisi terpanjang maks. `maxSide`, WebP (JPEG kalau browser tidak mendukung),
// kualitas diturunkan bertahap sampai ukurannya <= maxBytes.
export async function compressImage(file: File, { maxSide = 1080, maxBytes = 190_000 } = {}): Promise<string> {
  if (file.size > 25_000_000) throw new Error("Foto terlalu besar (maks. 25 MB sebelum dikompres)");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => fail(new Error("Gambar tidak bisa dibuka"));
      i.src = url;
    });
    let side = maxSide;
    for (let round = 0; round < 6; round++) {
      const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      for (const q of [0.82, 0.72, 0.62, 0.52]) {
        let d = c.toDataURL("image/webp", q);
        if (!d.startsWith("data:image/webp")) d = c.toDataURL("image/jpeg", q);
        if ((d.length - d.indexOf(",") - 1) * 0.75 <= maxBytes) return d;
      }
      side = Math.round(side * 0.8);
    }
    throw new Error("Foto tidak bisa dikecilkan sampai 200 KB, coba foto lain");
  } finally {
    URL.revokeObjectURL(url);
  }
}
