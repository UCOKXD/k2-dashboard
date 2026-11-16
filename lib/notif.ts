// Notifikasi WhatsApp ke grup kelas: jenis event, template bawaan, dan perakit pesan.
// Aman dipakai di browser (dipakai juga untuk pratinjau di Panel Admin).

export type NotifType =
  | "pelanggaran"
  | "izin_tidak_masuk"
  | "izin_sakit"
  | "petugas_doa"
  | "tempat_duduk"
  | "ulang_tahun"
  | "tugas_baru"
  | "tugas_deadline"
  | "ngl_buka"
  | "ngl_tutup"
  | "ngl_progres"
  | "tes";

type Def = {
  type: NotifType;
  label: string; // nama jenis di Panel Admin
  plural: string; // untuk judul rangkuman, mis. "3 laporan pelanggaran baru"
  fields: { key: string; label: string }[]; // isian yang bisa dipakai di template, mis. {nama}
  sample: Record<string, string>;
  template: string;
};

const COMMON = [
  { key: "dilaporkan_oleh", label: "Nama pelapor" },
  { key: "waktu_laporan", label: "Waktu laporan (WIB)" },
];

export const NOTIF_DEFS: Def[] = [
  {
    type: "pelanggaran",
    label: "Pelanggaran baru",
    plural: "laporan pelanggaran baru",
    fields: [
      { key: "nama", label: "Nama lengkap" },
      { key: "panggilan", label: "Panggilan" },
      { key: "pelanggaran", label: "Jenis pelanggaran" },
      { key: "keterangan", label: "Keterangan" },
      { key: "poin", label: "Poin" },
      { key: "tanggal", label: "Tanggal kejadian" },
      ...COMMON,
    ],
    sample: { nama: "Siswa Contoh", panggilan: "Contoh", pelanggaran: "Terlambat", keterangan: "Datang 08.20", poin: "1", tanggal: "12/10/2026" },
    template: "⚠️ *PELANGGARAN BARU*\n\nNama: *{nama}*\nPelanggaran: {pelanggaran}\nKeterangan: {keterangan}\nPoin: +{poin}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "izin_tidak_masuk",
    label: "Izin tidak masuk / telat / pulang awal",
    plural: "izin tidak masuk baru",
    fields: [
      { key: "nama", label: "Nama lengkap" },
      { key: "panggilan", label: "Panggilan" },
      { key: "jenis", label: "Jenis izin" },
      { key: "alasan", label: "Alasan" },
      { key: "tanggal", label: "Tanggal izin" },
      ...COMMON,
    ],
    sample: { nama: "Siswa Contoh", panggilan: "Contoh", jenis: "Tidak hadir", alasan: "Acara keluarga", tanggal: "13/10/2026" },
    template: "📝 *IZIN TIDAK MASUK*\n\nNama: *{nama}*\nJenis izin: {jenis}\nAlasan: {alasan}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "izin_sakit",
    label: "Izin sakit",
    plural: "izin sakit baru",
    fields: [
      { key: "nama", label: "Nama lengkap" },
      { key: "panggilan", label: "Panggilan" },
      { key: "keluhan", label: "Keluhan" },
      { key: "surat_dokter", label: "Surat dokter (Ada/Tidak ada)" },
      { key: "catatan", label: "Catatan" },
      { key: "tanggal", label: "Tanggal sakit" },
      ...COMMON,
    ],
    sample: { nama: "Siswa Contoh", panggilan: "Contoh", keluhan: "Demam", surat_dokter: "Ada", catatan: "", tanggal: "12/10/2026" },
    template: "🤒 *IZIN SAKIT*\n\nNama: *{nama}*\nKeluhan: {keluhan}\nSurat dokter: {surat_dokter}\nCatatan: {catatan}\n\nSemoga lekas sembuh, {panggilan}! 🙏\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "petugas_doa",
    label: "Petugas doa hari ini",
    plural: "info petugas doa",
    fields: [{ key: "nama", label: "Nama lengkap" }, { key: "panggilan", label: "Panggilan" }, ...COMMON],
    sample: { nama: "Siswa Contoh", panggilan: "Contoh" },
    template: "🙏 *PETUGAS DOA HARI INI*\n\n*{nama}*\nSiapkan doa untuk kelas hari ini ya, {panggilan}!\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "tempat_duduk",
    label: "Tempat duduk diperbarui",
    plural: "info tempat duduk",
    fields: [{ key: "link", label: "Link halaman tempat duduk" }, ...COMMON],
    sample: { link: "https://k2-dashboard-eight.vercel.app/tempat-duduk" },
    template: "🪑 *TEMPAT DUDUK DIPERBARUI*\n\nDenah tempat duduk terbaru sudah keluar. Cek posisimu di sini:\n{link}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "ulang_tahun",
    label: "Ulang tahun hari ini (dikirim 07.30–17.00 WIB)",
    plural: "info ulang tahun",
    fields: [{ key: "nama", label: "Nama lengkap (dipisah koma)" }, { key: "panggilan", label: "Panggilan (dipisah koma)" }, { key: "link", label: "Link web K2" }, ...COMMON],
    sample: { nama: "Siswa Contoh", panggilan: "Contoh", link: "https://k2-dashboard-eight.vercel.app" },
    template: "🎂 *SELAMAT ULANG TAHUN!* 🎉\n\nHari ini *{nama}* berulang tahun.\nSelamat ulang tahun, {panggilan}! Semoga sehat, sukses, dan makin semangat 🥳\n\nKirim ucapan lewat web K2:\n{link}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "tugas_baru",
    label: "Tugas baru ditambahkan",
    plural: "tugas baru",
    fields: [
      { key: "judul", label: "Judul tugas" },
      { key: "matkul", label: "Mata kuliah" },
      { key: "deadline", label: "Deadline (hari, tanggal, jam)" },
      { key: "kesulitan", label: "Tingkat kesulitan" },
      { key: "catatan", label: "Catatan" },
      { key: "link", label: "Link halaman tugas" },
      ...COMMON,
    ],
    sample: { judul: "Quiz Basis Data", matkul: "Basis Data", deadline: "Jumat, 20 Nov 2026, 23.59 WIB", kesulitan: "Sedang", catatan: "Materi pertemuan 1-6", link: "https://k2-dashboard-eight.vercel.app/kalender-acara" },
    template: "📚 *TUGAS BARU*\n\n*{judul}*\nMata kuliah: {matkul}\nDeadline: {deadline}\nKesulitan: {kesulitan}\nCatatan: {catatan}\n\nLihat semua tugas:\n{link}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "tugas_deadline",
    label: "Pengingat deadline tugas H-3, H-2, H-1 (dikirim mulai 07.30 WIB)",
    plural: "pengingat deadline tugas",
    fields: [
      { key: "judul", label: "Judul tugas" },
      { key: "matkul", label: "Mata kuliah" },
      { key: "deadline", label: "Deadline (hari, tanggal, jam)" },
      { key: "kesulitan", label: "Tingkat kesulitan" },
      { key: "catatan", label: "Catatan" },
      { key: "link", label: "Link halaman tugas" },
      { key: "sisa", label: "Sisa waktu (H-3 / H-2 / H-1)" },
      { key: "sisa_hari", label: "Sisa waktu dalam kata (3 hari lagi / besok)" },
      ...COMMON,
    ],
    sample: { judul: "Quiz Basis Data", matkul: "Basis Data", deadline: "Jumat, 20 Nov 2026, 23.59 WIB", kesulitan: "Sedang", catatan: "Materi pertemuan 1-6", sisa: "H-1", sisa_hari: "besok", link: "https://k2-dashboard-eight.vercel.app/kalender-acara" },
    template: "⏰ *DEADLINE {sisa}: {judul}*\n\nDeadline-nya {sisa_hari}, jangan sampai lupa ya!\nMata kuliah: {matkul}\nDeadline: {deadline}\nKesulitan: {kesulitan}\nCatatan: {catatan}\n\nLihat semua tugas:\n{link}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "ngl_buka",
    label: "Sesi NGL dibuka",
    plural: "info sesi NGL",
    fields: [{ key: "link", label: "Link halaman NGL" }, ...COMMON],
    sample: { link: "https://k2-dashboard-eight.vercel.app/ngl" },
    template: "💌 *SESI NGL DIBUKA!*\n\nSaatnya kirim apresiasi dan masukan untuk teman sekelas. Isi untuk semua teman ya, boleh anonim atau pakai nama.\n\nIsi di sini:\n{link}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "ngl_tutup",
    label: "Sesi NGL ditutup",
    plural: "info sesi NGL",
    fields: [
      { key: "persen", label: "Persen terisi" },
      { key: "jumlah", label: "Jumlah pesan" },
      { key: "link", label: "Link halaman NGL" },
      ...COMMON,
    ],
    sample: { persen: "92", jumlah: "1032", link: "https://k2-dashboard-eight.vercel.app/ngl" },
    template: "📬 *SESI NGL DITUTUP*\n\nTerima kasih sudah mengisi! Total {jumlah} pesan terkirim ({persen}% terisi).\nPesan untukmu sudah bisa dibaca di:\n{link}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "ngl_progres",
    label: "Progres pengisian NGL (50/70/90/100%)",
    plural: "info progres NGL",
    fields: [
      { key: "persen", label: "Persen terisi" },
      { key: "jumlah", label: "Jumlah pesan" },
      { key: "total", label: "Total pesan yang harus diisi" },
      { key: "link", label: "Link halaman NGL" },
      ...COMMON,
    ],
    sample: { persen: "70", jumlah: "786", total: "1122", link: "https://k2-dashboard-eight.vercel.app/ngl" },
    template: "📊 *NGL SUDAH {persen}% TERISI*\n\n{jumlah} dari {total} pesan sudah terkirim. Yang belum, yuk lengkapi untuk semua teman:\n{link}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
  {
    type: "tes",
    label: "Pesan uji",
    plural: "pesan uji",
    fields: [{ key: "isi", label: "Isi pesan" }, ...COMMON],
    sample: { isi: "Bot notifikasi K2 tersambung." },
    template: "✅ *PESAN UJI DARI WEB K2*\n\n{isi}\n\nDilaporkan oleh: {dilaporkan_oleh}\nWaktu laporan: {waktu_laporan}",
  },
];

export const NOTIF_DEF = Object.fromEntries(NOTIF_DEFS.map((d) => [d.type, d])) as Record<NotifType, Def>;
export const isNotifType = (t: unknown): t is NotifType => typeof t === "string" && t in NOTIF_DEF;

export type NotifSettings = {
  enabled: Record<NotifType, boolean>;
  templates: Record<NotifType, string>;
  interval: number; // detik antar-pengecekan antrian oleh bot
};

export const DEFAULT_INTERVAL = 30;
export const defaultSettings = (): NotifSettings => ({
  enabled: Object.fromEntries(NOTIF_DEFS.map((d) => [d.type, true])) as Record<NotifType, boolean>,
  templates: Object.fromEntries(NOTIF_DEFS.map((d) => [d.type, d.template])) as Record<NotifType, string>,
  interval: DEFAULT_INTERVAL,
});

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// "Senin, 12 Okt 2026, 14.15 WIB" (WIB = UTC+7, tanpa musim panas).
export function fmtWib(iso: string) {
  const d = new Date(new Date(iso).getTime() + 7 * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${p(d.getUTCHours())}.${p(d.getUTCMinutes())} WIB`;
}

// Isi template: {kunci} diganti data. Baris yang isiannya kosong dihapus (mis. "Keterangan: " tanpa keterangan).
export function render(template: string, data: Record<string, string>) {
  return template
    .split("\n")
    .flatMap((line) => {
      let empty = false;
      const out = line.replace(/\{(\w+)\}/g, (_, k: string) => {
        const v = (data[k] ?? "").trim();
        if (!v) empty = true;
        return v;
      });
      return empty ? [] : [out];
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n") // baris kosong ganda setelah baris dihapus
    .trim();
}

// Data notifikasi dari satu tugas, dipakai untuk "tugas baru" dan pengingat deadline.
export function taskNotifData(t: { judul: string; matkul: string; deadline: string; jam: string; difficulty: 1 | 2 | 3; catatan: string }) {
  const [y, m, d] = t.deadline.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d));
  const tgl = `${HARI[day.getUTCDay()]}, ${d} ${BULAN[m - 1]} ${y}${t.jam ? `, ${t.jam.replace(":", ".")} WIB` : ""}`;
  return { judul: t.judul, matkul: t.matkul, deadline: tgl, kesulitan: ["", "Mudah", "Sedang", "Sulit"][t.difficulty], catatan: t.catatan, link: "/kalender-acara" };
}
