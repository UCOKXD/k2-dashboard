// Hanya dipakai di server. API key tidak pernah sampai ke browser.
import { STUDENTS, resolveName } from "@/lib/students";
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

// Tanggal dari Sheets ditulis sesuai locale spreadsheet: "6/10/2026" bisa 6 Okt (Indonesia) atau 10 Jun (AS).
// Urutan dibaca dari pengaturan locale spreadsheet; semua tanggal lalu disamakan jadi DD/MM/YYYY.
const DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/;

async function sheetLocale(id: string, key: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/${id}?fields=properties.locale&key=${key}`, { next: { revalidate: 86_400 } });
    if (!res.ok) return null;
    return ((await res.json()) as { properties?: { locale?: string } }).properties?.locale ?? null;
  } catch {
    return null;
  }
}

function monthFirst(locale: string | null, rows: string[][]): boolean {
  if (locale) {
    try {
      const parts = new Intl.DateTimeFormat(locale.replace("_", "-"), { day: "numeric", month: "numeric" }).formatToParts(new Date(2000, 11, 31));
      return parts.findIndex((p) => p.type === "month") < parts.findIndex((p) => p.type === "day");
    } catch {}
  }
  // Tanpa info locale: tebak dari data (angka > 12 pasti tanggal).
  let dmy = 0,
    mdy = 0;
  for (const r of rows)
    for (const c of r) {
      const m = DATE_RE.exec(c ?? "");
      if (!m) continue;
      if (Number(m[1]) > 12) dmy++;
      else if (Number(m[2]) > 12) mdy++;
    }
  return mdy > dmy;
}

const pad2 = (s: string) => s.padStart(2, "0");

async function fetchForm(): Promise<string[][]> {
  const id = process.env.SHEET_ID;
  const key = process.env.GOOGLE_API_KEY;
  if (!id || !key) throw new Error("SHEET_ID / GOOGLE_API_KEY belum diset");
  const range = encodeURIComponent(`'${TAB}'!A:T`);
  const [res, locale] = await Promise.all([fetch(`${BASE}/${id}/values/${range}?key=${key}`, { next: { revalidate: 30 } }), sheetLocale(id, key)]);
  if (!res.ok) throw new Error(`Sheets API error ${res.status}`); // URL (berisi key) tidak ikut di pesan
  const values = ((await res.json()) as { values?: string[][] }).values ?? [];
  const [head = [], ...rows] = values;
  const mf = monthFirst(locale, rows);
  const fix = (c: string) => {
    const m = DATE_RE.exec(c ?? "");
    if (!m) return c;
    const [d, mo] = mf ? [m[2], m[1]] : [m[1], m[2]];
    return `${pad2(d)}/${pad2(mo)}/${m[3]}${m[4]}`;
  };
  return [head, ...rows.map((r) => r.map(fix))];
}

// Kolom nama siswa = kolom berjudul "nama" yang isinya paling banyak cocok dengan daftar siswa
// (supaya kolom seperti "Nama Pengisi" tidak salah terpilih).
function bestNameCol(cols: { key: string; label: string }[], rows: Row[]): string | undefined {
  let best: { key: string; score: number } | undefined;
  for (const col of cols.filter((x) => /nama/i.test(x.label))) {
    const score = rows.filter((r) => STUDENT_NAMES.has(resolveName(r[col.key] ?? ""))).length;
    if (score > 0 && (!best || score > best.score)) best = { key: col.key, score };
  }
  return best?.key;
}
const STUDENT_NAMES = new Set(STUDENTS.map((s) => s.full));

// Kolom berisi file/foto (surat dokter, bukti, lampiran) tidak ditampilkan.
const FILE_COL = /surat dokter|bukti|lampiran|unggah|upload|foto|file/i;

export async function getTable(name: keyof typeof TABLES): Promise<Table> {
  const { filter, cols, nameFrom, nameCol } = TABLES[name];
  const [head = [], ...data] = await fetchForm();
  const letters = cols.split("").filter((l) => l !== "C" && !FILE_COL.test(head[idx(l)] ?? "")); // kolom C = kategori, sudah difilter
  const c = letters.map((l) => ({ key: l, label: head[idx(l)] || l }));
  const picked = data.filter((r) => norm(r[2]) === norm(filter)).map((r) => Object.fromEntries(letters.map((l) => [l, (r[idx(l)] ?? "").trim()])));
  return {
    cols: c,
    rows: picked,
    name: nameCol || bestNameCol(c.slice(nameFrom), picked) || c.slice(nameFrom).find((x) => /nama/i.test(x.label))?.key || c[nameFrom]?.key || "B",
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
