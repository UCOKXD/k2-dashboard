// Inventaris kelas (khusus pengurus dengan izin "inventaris", bawaannya IT & Logistik).
// Aman dipakai di browser: hanya tipe, konstanta, dan pembersih data. Penyimpanan ada di app/api/inventaris.

export const KONDISI = ["baik", "rusak", "hilang"] as const;
export type Kondisi = (typeof KONDISI)[number];
export const KONDISI_LABEL: Record<Kondisi, string> = { baik: "Baik", rusak: "Rusak", hilang: "Hilang" };

export type InvItem = { id: string; nama: string; jumlah: number; kondisi: Kondisi; lokasi: string; catatan: string };
// kembali kosong = masih dipinjam.
export type InvLoan = { id: string; itemId: string; peminjam: string; jumlah: number; pinjam: string; rencana: string; kembali: string; catatan: string };
export type InvData = { items: InvItem[]; loans: InvLoan[] };

export const EMPTY_INV: InvData = { items: [], loans: [] };
export const INV_MAX_ITEMS = 300;
export const INV_MAX_LOANS = 500;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v: unknown, min: number, max: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : min;
};
const tgl = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
const ID_RE = /^[a-z0-9-]{4,40}$/;

// Jumlah yang sedang dipinjam untuk satu barang.
export const dipinjam = (d: InvData, itemId: string) => d.loans.filter((l) => l.itemId === itemId && !l.kembali).reduce((n, l) => n + l.jumlah, 0);

// Bersihkan kiriman dari browser. Peminjaman yang barangnya sudah dihapus ikut terbuang;
// kalau terlalu banyak, catatan yang sudah dikembalikan paling lama dibuang duluan.
export function cleanInv(b: unknown): InvData | string {
  const o = (b ?? {}) as Record<string, unknown>;
  if (!Array.isArray(o.items) || !Array.isArray(o.loans)) return "Data inventaris tidak valid";
  if (o.items.length > INV_MAX_ITEMS) return `Maksimal ${INV_MAX_ITEMS} barang`;
  const items: InvItem[] = [];
  const seen = new Set<string>();
  for (const x of o.items) {
    const it = (x ?? {}) as Record<string, unknown>;
    const id = typeof it.id === "string" && ID_RE.test(it.id) ? it.id : "";
    const nama = str(it.nama, 80);
    if (!id || seen.has(id)) continue;
    if (!nama) return "Nama barang wajib diisi";
    seen.add(id);
    items.push({
      id,
      nama,
      jumlah: int(it.jumlah, 0, 9999),
      kondisi: KONDISI.find((k) => k === it.kondisi) ?? "baik",
      lokasi: str(it.lokasi, 80),
      catatan: str(it.catatan, 200),
    });
  }
  let loans: InvLoan[] = [];
  for (const x of o.loans) {
    const l = (x ?? {}) as Record<string, unknown>;
    const id = typeof l.id === "string" && ID_RE.test(l.id) ? l.id : "";
    const itemId = typeof l.itemId === "string" ? l.itemId : "";
    if (!id || !seen.has(itemId)) continue;
    const peminjam = str(l.peminjam, 80);
    const pinjam = tgl(l.pinjam);
    if (!peminjam) return "Nama peminjam wajib diisi";
    if (!pinjam) return "Tanggal pinjam wajib diisi";
    loans.push({ id, itemId, peminjam, jumlah: int(l.jumlah, 1, 9999), pinjam, rencana: tgl(l.rencana), kembali: tgl(l.kembali), catatan: str(l.catatan, 200) });
  }
  if (loans.length > INV_MAX_LOANS) {
    const done = loans.filter((l) => l.kembali).sort((a, b) => a.kembali.localeCompare(b.kembali));
    const drop = new Set(done.slice(0, loans.length - INV_MAX_LOANS).map((l) => l.id));
    loans = loans.filter((l) => !drop.has(l.id));
  }
  const data = { items, loans };
  const over = items.find((it) => dipinjam(data, it.id) > it.jumlah);
  if (over) return `Jumlah "${over.nama}" yang dipinjam melebihi stok`;
  return data;
}
