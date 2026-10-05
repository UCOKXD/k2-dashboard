// Hanya dipakai di server. API key tidak pernah sampai ke browser.
const BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const TAB = "Form Responses 1";

export type Row = Record<string, string>;
export type Table = {
  cols: { key: string; label: string }[]; // key = huruf kolom di sheet
  rows: Row[];
  name: string; // key kolom nama
  date: string; // key kolom tanggal
};

// Padanan formula QUERY di Sheets: kolom yang diambil + filter kategori di kolom C.
// nameCol: isi huruf kolom (mis. "D") jika deteksi otomatis kolom nama salah.
export const TABLES = {
  pelanggaran: { filter: "Pelanggaran", cols: "ABCDEFG", nameFrom: 2, nameCol: "" },
  sakit: { filter: "Izin Sakit", cols: "ABCLMNOP", nameFrom: 1, nameCol: "" },
  izin: { filter: "Izin Tidak Hadir/ Telat / Pulang Lebih Awal", cols: "ABCHIJK", nameFrom: 1, nameCol: "" },
  acara: { filter: "Acara Mendatang", cols: "ABCQRST", nameFrom: 1, nameCol: "" },
};

const idx = (letter: string) => letter.charCodeAt(0) - 65;
const norm = (s = "") => s.replace(/\s+/g, " ").trim().toLowerCase();

async function fetchForm(): Promise<string[][]> {
  const id = process.env.SHEET_ID;
  const key = process.env.GOOGLE_API_KEY;
  if (!id || !key) throw new Error("SHEET_ID / GOOGLE_API_KEY belum diset");
  const range = encodeURIComponent(`'${TAB}'!A:T`);
  const res = await fetch(`${BASE}/${id}/values/${range}?key=${key}`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Sheets API error ${res.status}`); // URL (berisi key) tidak ikut di pesan
  return ((await res.json()) as { values?: string[][] }).values ?? [];
}

export async function getTable(name: keyof typeof TABLES): Promise<Table> {
  const { filter, cols, nameFrom, nameCol } = TABLES[name];
  const [head = [], ...data] = await fetchForm();
  const letters = cols.split("").filter((l) => l !== "C"); // kolom C = kategori, sudah difilter
  const c = letters.map((l) => ({ key: l, label: head[idx(l)] || l }));
  return {
    cols: c,
    rows: data
      .filter((r) => norm(r[2]) === norm(filter))
      .map((r) => Object.fromEntries(letters.map((l) => [l, (r[idx(l)] ?? "").trim()]))),
    name: nameCol || c.slice(nameFrom).find((x) => /nama/i.test(x.label))?.key || c[nameFrom]?.key || "B",
    date: c.find((x, i) => i > 0 && /tanggal|tgl/i.test(x.label))?.key ?? "A",
  };
}

// Format tanggal di sheet diasumsikan DD/MM/YYYY (locale Indonesia). Vercel jalan di UTC, jadi pakai zona Jakarta.
const jkt = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
function dmy(s = "") {
  const [d, m, y] = s.split(/\D+/).map(Number);
  return { d, m, y: y < 100 ? 2000 + y : y };
}
export function isToday(s?: string) {
  const n = jkt(), t = dmy(s);
  return t.d === n.getDate() && t.m === n.getMonth() + 1 && t.y === n.getFullYear();
}
export function isThisMonth(s?: string) {
  const n = jkt(), t = dmy(s);
  return t.m === n.getMonth() + 1 && t.y === n.getFullYear();
}
