// Fungsi murni untuk halaman utama: mengubah data Google Sheets (Table) menjadi data siap tampil.
// Aman dipakai di server maupun browser (tidak menyentuh API key).
import type { Table } from "@/lib/sheets";
import { STUDENTS, resolveName } from "@/lib/students";

// Kolom pelanggaran di sheet dideteksi otomatis dari judul kolom.
// Kalau salah tebak, isi huruf kolomnya di sini (mis. kategori: "D", ket: "E").
const PEL_COLS = { kategori: "", ket: "" };

export type LogType = "pelanggaran" | "sakit" | "izin" | "acara";

export type LogItem = {
  id: string;
  type: LogType;
  title: string;
  detail: string;
  daysAgo: number;
  time: string;
};

export type StudentStat = {
  nama: string; // nama lengkap
  short: string; // panggilan
  jumlah: number;
  kategori: string; // kategori paling sering ("" kalau belum ada pelanggaran)
  pelanggaran: string[]; // maksimal 3 pelanggaran terbaru
};

export type CategoryStat = { kategori: string; jumlah: number; persen: number };

export type RecentViolation = { nama: string; aksi: string; kategori: string; time: string };

export type PelanggaranData = {
  total: number;
  students: StudentStat[]; // urut pelanggaran terbanyak
  categories: CategoryStat[];
  recent: RecentViolation[]; // terbaru dulu
};

export type HomeData = {
  stats: { pelanggaranBulanIni: number; sakitHariIni: string[] };
  pelanggaran: PelanggaranData;
  logs: LogItem[];
};

const shortOf = (full: string) => STUDENTS.find((s) => s.full === full)?.short ?? full;

// Selisih hari antara hari ini (zona Jakarta) dan tanggal "DD/MM/YYYY ..." di sheet.
export function daysAgo(s = ""): number | null {
  const [d, m, y] = s.split(/\D+/).map(Number);
  if (!d || !m || !y) return null;
  const n = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const today = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.round((today - Date.UTC(y < 100 ? 2000 + y : y, m - 1, d)) / 86_400_000);
}

export function agoLabel(d: number | null) {
  if (d === null || d <= 0) return "Hari ini";
  return d === 1 ? "Kemarin" : `${d} hari lalu`;
}

function pelCols(t: Table) {
  const rest = t.cols.filter((c) => c.key !== "A" && c.key !== t.name && c.key !== t.date);
  const find = (re: RegExp) => rest.find((c) => re.test(c.label))?.key;
  const kategori = PEL_COLS.kategori || find(/jenis|kategori|bentuk/i) || find(/pelanggaran/i) || rest[0]?.key || "";
  const ket = PEL_COLS.ket || find(/keterangan|alasan|detail|deskripsi|uraian|kronologi|catatan/i) || kategori;
  return { kategori, ket };
}

const clip = (s: string, n = 140) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function buildPelanggaran(t: Table): PelanggaranData {
  const { kategori, ket } = pelCols(t);
  const rows = t.rows
    .map((r) => {
      const kat = (kategori ? r[kategori] : "")?.trim() || "Lainnya";
      return {
        nama: resolveName(r[t.name] ?? ""),
        kat,
        ket: ((ket ? r[ket] : "")?.trim() || kat),
        ago: daysAgo(r.A),
      };
    })
    .filter((r) => r.nama);

  // per siswa (siswa tanpa pelanggaran tetap tampil)
  const per = new Map<string, typeof rows>(STUDENTS.map((s) => [s.full, []]));
  for (const r of rows) {
    if (!per.has(r.nama)) per.set(r.nama, []);
    per.get(r.nama)!.push(r);
  }
  const students: StudentStat[] = [...per]
    .map(([nama, rs]) => {
      const freq = new Map<string, number>();
      for (const r of rs) freq.set(r.kat, (freq.get(r.kat) ?? 0) + 1);
      const top = [...freq].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
      return {
        nama,
        short: shortOf(nama),
        jumlah: rs.length,
        kategori: top,
        pelanggaran: rs.slice(-3).reverse().map((r) => r.ket),
      };
    })
    .sort((a, b) => b.jumlah - a.jumlah || a.nama.localeCompare(b.nama));

  // kategori (huruf besar-kecil dianggap sama); lebih dari 5 jenis digabung jadi "Lainnya"
  const cat = new Map<string, { kategori: string; jumlah: number }>();
  for (const r of rows) {
    const k = r.kat.toLowerCase().replace(/\s+/g, " ");
    const c = cat.get(k) ?? { kategori: r.kat, jumlah: 0 };
    c.jumlah++;
    cat.set(k, c);
  }
  const sorted = [...cat.values()].sort((a, b) => b.jumlah - a.jumlah);
  const shown = sorted.length > 6 ? sorted.slice(0, 5) : sorted;
  const rest = sorted.length > 6 ? sorted.slice(5).reduce((n, c) => n + c.jumlah, 0) : 0;
  if (rest) shown.push({ kategori: "Lainnya", jumlah: rest });
  const total = rows.length;
  const categories = shown.map((c) => ({ ...c, persen: total ? Math.round((c.jumlah / total) * 100) : 0 }));

  const recent = rows
    .slice(-3)
    .reverse()
    .map((r) => ({ nama: shortOf(r.nama), aksi: r.ket, kategori: r.kat, time: agoLabel(r.ago) }));

  return { total, students, categories, recent };
}

const TITLE: Record<LogType, string> = {
  pelanggaran: "Laporan Pelanggaran Terbaru",
  sakit: "Laporan Izin Sakit",
  izin: "Laporan Izin Tidak Hadir / Telat",
  acara: "Acara Baru Ditambahkan",
};

// Gabungkan laporan terbaru dari semua tab sheet menjadi satu daftar log (maksimal `maxDays` hari ke belakang).
export function buildLogs(tables: Record<LogType, Table>, maxDays = 14): LogItem[] {
  const out: (LogItem & { seq: number })[] = [];
  for (const type of Object.keys(TITLE) as LogType[]) {
    const t = tables[type];
    const pc = type === "pelanggaran" ? pelCols(t) : null;
    const others = t.cols.filter((c) => c.key !== "A" && c.key !== t.name);
    t.rows.forEach((r, seq) => {
      const ago = daysAgo(r.A);
      if (ago === null || ago > maxDays) return;
      const raw = (r[t.name] ?? "").trim();
      const who = type === "acara" ? raw : shortOf(resolveName(raw));
      let detail: string;
      if (pc) {
        const kat = (r[pc.kategori] ?? "").trim();
        const ket = (r[pc.ket] ?? "").trim();
        detail = `${who}: ${ket || kat}${kat && ket && kat !== ket ? ` (${kat})` : ""}`;
      } else {
        const extra = others.map((c) => (r[c.key] ?? "").trim()).filter(Boolean).slice(0, type === "acara" ? 3 : 2);
        detail = [who, ...extra].filter(Boolean).join(" · ");
      }
      const d = Math.max(ago, 0);
      out.push({ id: `${type}-${seq}`, type, title: TITLE[type], detail: clip(detail), daysAgo: d, time: agoLabel(d), seq });
    });
  }
  return out
    .sort((a, b) => a.daysAgo - b.daysAgo || b.seq - a.seq)
    .slice(0, 120)
    .map(({ seq: _seq, ...log }) => log);
}
