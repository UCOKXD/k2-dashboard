// Fungsi murni untuk halaman utama: mengubah data Google Sheets (Table) menjadi data siap tampil.
// Aman dipakai di server maupun browser (tidak menyentuh API key).
import type { Table } from "@/lib/sheets";
import { STUDENTS, resolveName } from "@/lib/students";
import type { DoaPick } from "@/lib/store";
import { DEFAULT_PEL, type ActivityLog, type OrgData, type PelOverrides, type ScheduleItem, type SlidesData } from "@/lib/content";
import type { CalEvent } from "@/lib/acara";

// Kolom pelanggaran di sheet dideteksi otomatis dari judul kolom.
// Kalau salah tebak, isi huruf kolomnya di sini (mis. kategori: "D", ket: "E").
const PEL_COLS = { kategori: "", ket: "" };

export type LogType = "pelanggaran" | "sakit" | "izin" | "acara" | "doa" | "seat";

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
  jumlah: number; // total poin
  kasus: number; // jumlah catatan
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
  shame: StudentStat[]; // Hall of Shame
};

export type HomeCards = {
  nextEvent: (CalEvent & { days: number }) | null;
  doaToday: DoaPick | null;
  ultah: { nama: string; short: string; mmdd: string; days: number }[];
  schedule: ScheduleItem[];
};

export type HomeData = {
  stats: { totalSakit: number };
  pelanggaran: PelanggaranData;
  logs: LogItem[];
  org: OrgData;
  slides: SlidesData;
  cards: HomeCards;
};

// Riwayat acak doa yang hanya tersimpan di browser (dipakai selama penyimpanan server belum dipasang).
export const LOCAL_DOA_LOG = "k2-doa-log";

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

// Satu catatan pelanggaran: dari sheet (bisa dikoreksi admin) atau ditambahkan admin.
export type PelRow = {
  id: string;
  source: "sheet" | "admin";
  nama: string; // nama lengkap
  kat: string;
  ket: string;
  tanggal: string; // DD/MM/YYYY
  ago: number | null;
  poin: number;
  hidden: boolean;
};

const ymdToDmy = (s: string) => {
  const [y, m, d] = s.split("-");
  return y && m && d ? `${d}/${m}/${y}` : s;
};

// Semua catatan (termasuk yang disembunyikan admin), urut dari yang terlama.
export function pelRows(t: Table, ov: PelOverrides = DEFAULT_PEL): PelRow[] {
  const { kategori, ket } = pelCols(t);
  const sheet: PelRow[] = t.rows
    .map((r): PelRow => {
      const kat = (kategori ? r[kategori] : "")?.trim() || "Lainnya";
      const id = `s:${r.A}|${(r[t.name] ?? "").trim()}`;
      const e = ov.edits[id] ?? {};
      const tgl = (r[t.date] || r.A || "").split(" ")[0];
      return {
        id,
        source: "sheet",
        nama: resolveName(r[t.name] ?? ""),
        kat: e.kat?.trim() || kat,
        ket: e.ket?.trim() || ((ket ? r[ket] : "")?.trim() || kat),
        tanggal: tgl,
        ago: daysAgo(r.A),
        poin: e.poin ?? 1,
        hidden: !!e.hidden,
      };
    })
    .filter((r) => r.nama);
  const added: PelRow[] = ov.added.map((a) => {
    const e = ov.edits[a.id] ?? {};
    const tanggal = ymdToDmy(a.tanggal);
    return { id: a.id, source: "admin", nama: a.nama, kat: a.kat, ket: a.ket || a.kat, tanggal, ago: daysAgo(tanggal), poin: a.poin, hidden: !!e.hidden };
  });
  return [...sheet, ...added]
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (b.r.ago ?? 0) - (a.r.ago ?? 0) || a.i - b.i)
    .map(({ r }) => r);
}

export function buildPelanggaran(t: Table, ov: PelOverrides = DEFAULT_PEL): PelanggaranData {
  const rows = pelRows(t, ov).filter((r) => !r.hidden);

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
        jumlah: rs.reduce((n, r) => n + r.poin, 0),
        kasus: rs.length,
        kategori: top,
        pelanggaran: rs.slice(-3).reverse().map((r) => r.ket),
      };
    })
    .sort((a, b) => b.jumlah - a.jumlah || b.kasus - a.kasus || a.nama.localeCompare(b.nama));

  // kategori (huruf besar-kecil dianggap sama); lebih dari 6 jenis digabung jadi "Lainnya"
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

  // Hall of Shame: 3 poin tertinggi, kecuali siswa yang dikecualikan admin.
  const shame = students.filter((s) => s.jumlah > 0 && !ov.hideFromShame.includes(s.nama)).slice(0, 3);

  return { total, students, categories, recent, shame };
}

const TITLE: Record<Exclude<LogType, "doa" | "seat">, string> = {
  pelanggaran: "Laporan Pelanggaran Terbaru",
  sakit: "Laporan Izin Sakit",
  izin: "Laporan Izin Tidak Hadir / Telat",
  acara: "Acara Baru Ditambahkan",
};

// Gabungkan laporan terbaru dari semua tab sheet menjadi satu daftar log (maksimal `maxDays` hari ke belakang).
type Sources = { pelanggaran: PelRow[]; sakit: Table; izin: Table; acara: Table };

export function buildLogs(src: Sources, doa: DoaPick[] = [], activity: ActivityLog[] = [], maxDays = 14): LogItem[] {
  const out: (LogItem & { seq: number })[] = [];
  src.pelanggaran
    .filter((r) => !r.hidden)
    .forEach((r, seq) => {
      if (r.ago === null || r.ago > maxDays) return;
      const d = Math.max(r.ago, 0);
      const detail = `${shortOf(r.nama)}: ${r.ket}${r.kat && r.kat !== r.ket ? ` (${r.kat})` : ""}`;
      out.push({ id: `pel-${r.id}`, type: "pelanggaran", title: TITLE.pelanggaran, detail: clip(detail), daysAgo: d, time: agoLabel(d), seq });
    });
  for (const type of ["sakit", "izin", "acara"] as const) {
    const t = src[type];
    const others = t.cols.filter((c) => c.key !== "A" && c.key !== t.name);
    t.rows.forEach((r, seq) => {
      const ago = daysAgo(r.A);
      if (ago === null || ago > maxDays) return;
      const raw = (r[t.name] ?? "").trim();
      const who = type === "acara" ? raw : shortOf(resolveName(raw));
      const extra = others.map((c) => (r[c.key] ?? "").trim()).filter(Boolean).slice(0, type === "acara" ? 3 : 2);
      const detail = [who, ...extra].filter(Boolean).join(" · ");
      const d = Math.max(ago, 0);
      out.push({ id: `${type}-${seq}`, type, title: TITLE[type], detail: clip(detail), daysAgo: d, time: agoLabel(d), seq });
    });
  }
  doa.forEach((p, seq) => {
    const log = doaLog(p, seq);
    if (log.daysAgo <= maxDays) out.push({ ...log, seq: 1e6 + seq });
  });
  activity.forEach((a, seq) => {
    const log = activityLog(a, seq);
    if (log.daysAgo <= maxDays) out.push({ ...log, seq: 2e6 - seq });
  });
  return out
    .sort((a, b) => a.daysAgo - b.daysAgo || b.seq - a.seq)
    .slice(0, 120)
    .map(({ seq: _seq, ...log }) => log); // eslint-disable-line @typescript-eslint/no-unused-vars
}

// Tanggal "DD/MM/YYYY" (zona Jakarta) dari waktu ISO, supaya bisa dihitung daysAgo seperti data sheet.
const jktDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" });

export function doaLog(p: DoaPick, seq = 0): LogItem {
  const d = Math.max(daysAgo(jktDate(p.at)) ?? 0, 0);
  const jam = new Date(p.at).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
  return {
    id: `doa-${p.at}-${seq}`,
    type: "doa",
    title: "Petugas doa hari ini telah diacak admin",
    detail: `Petugas hari ini : ${p.name} (${p.nim})${p.by ? ` · diacak oleh ${p.by}` : ""}`,
    daysAgo: d,
    time: d === 0 ? `Hari ini, ${jam}` : agoLabel(d),
  };
}

export function activityLog(a: ActivityLog, seq = 0): LogItem {
  const d = Math.max(daysAgo(jktDate(a.at)) ?? 0, 0);
  const jam = new Date(a.at).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
  return { id: `act-${a.at}-${seq}`, type: a.type, title: a.title, detail: a.detail, daysAgo: d, time: d === 0 ? `Hari ini, ${jam}` : agoLabel(d) };
}
