// Siswa ABSORBING PPTI 28: [nama lengkap, panggilan], urut sesuai nomor absen.
// Panggilan mengikuti Data Pengurus Kelas CAWU 1.
const RAW: [string, string][] = [
  ["Aditya Yoga Eka Saputra", "Adit"],
  ["Ahmad Zaqi", "Zaqi"],
  ["Alexander Steven Kurniawan", "Alex"],
  ["Aloysius Bryan Kenietzko", "Aloy"],
  ["Bernadeth Lidwina Hadibrata", "Ina"],
  ["Bonaventura Narendra Agung Wijaya", "Naren"],
  ["Bryan Valentino Poernomo", "Bryan"],
  ["Callista Anastasya", "Tasya"],
  ["Calvin Ramana Putra", "Calvin"],
  ["Carnessa Billyza", "Sasa"],
  ["Caroline Fiona Agatha Kandiawan", "Carol"],
  ["Celine Jessica", "Celine"],
  ["Davita Calista Putrijaya", "Davita"],
  ["Demetra Sandrea Suniadji", "Sandy"],
  ["Edward Devon Kosasih", "Edward"],
  ["Evelyn Davina", "Eve"],
  ["Fahri Roiza", "Fahri"],
  ["Francis Demetrio Villanova", "Ancis"],
  ["Grady Wiendy Koesnadi", "Grady"],
  ["Joevans Rafael Kosasih", "Joevans"],
  ["Justine Taniardi", "Justine"],
  ["Kadek Pradiipa Maheshvara", "Diipa"],
  ["Kalissta Clarindajaya", "Kallista"],
  ["La Radin Wahyu Novalino", "Radin"],
  ["Maria Godeliva Alexandra", "Maria"],
  ["Michael Aristo Bima Putra", "Michael"],
  ["Rizky Ikhsan Fadillah", "Rizky"],
  ["Samuel Christopher Kesuma", "Samuel"],
  ["Tania Audrey Susanto", "Tania"],
  ["Tegar Bagus Satria", "Tegar"],
  ["Teguh Iman Samaeri Gea", "Teguh"],
  ["Tiop Syalom Pakpahan", "Tiop"],
  ["William Moses", "William"],
  ["Yeremia Theofilus Handoyo", "Yeremia"],
];

// NIM sementara masih dummy. Ganti isi NIM di sini (urut absen 1-34) kalau data asli sudah ada.
const NIM: string[] = RAW.map((_, i) => `0000000${String(i + 1).padStart(3, "0")}`);

// Panggilan lama yang masih mungkin ditulis di Google Form (tetap dikenali sebagai siswa yang sama).
const ALIAS: Record<string, string[]> = {
  "Demetra Sandrea Suniadji": ["Dea"],
  "Yeremia Theofilus Handoyo": ["Yere"],
};

export const STUDENTS = RAW.map(([full, short], i) => ({ full, short, alias: ALIAS[full] ?? [], absen: i + 1, nim: NIM[i] }));

// Ubah nama dari form (nama lengkap, panggilan, atau nama depan) menjadi nama lengkap siswa.
// Nama yang tidak dikenali dikembalikan apa adanya; string kosong tetap kosong.
export function resolveName(raw: string) {
  const n = raw.trim().toLowerCase();
  if (!n) return "";
  const s = STUDENTS.find(
    (x) =>
      x.full.toLowerCase() === n ||
      x.short.toLowerCase() === n ||
      x.alias.some((a) => a.toLowerCase() === n) ||
      x.full.toLowerCase().startsWith(n + " ")
  );
  return s ? s.full : raw.trim();
}

// Hitung pelanggaran per siswa (0 tetap tampil). Nama di form boleh nama lengkap, panggilan, atau nama depan.
export function countBy(names: string[]) {
  const m = new Map(STUDENTS.map((s) => [s.full, 0]));
  for (const raw of names) {
    const k = resolveName(raw);
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m]
    .map(([nama, jumlah]) => ({ nama, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah || a.nama.localeCompare(b.nama));
}
