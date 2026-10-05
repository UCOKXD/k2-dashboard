// Siswa ABSORBING PPTI 28: [nama lengkap, panggilan di denah].
// Panggilan Ina, Sasa, dan Dea adalah tebakan dari denah, mohon dicek.
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
  ["Demetra Sandrea Suniadji", "Dea"],
  ["Edward Devon Kosasih", "Edward"],
  ["Evelyn Davina", "Eve"],
  ["Fahri Roiza", "Fahri"],
  ["Francis Demetrio Villanova", "Francis"],
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
  ["Yeremia Theofilus Handoyo", "Yere"],
];

export const STUDENTS = RAW.map(([full, short]) => ({ full, short }));

// Ubah nama dari form (nama lengkap, panggilan, atau nama depan) menjadi nama lengkap siswa.
// Nama yang tidak dikenali dikembalikan apa adanya; string kosong tetap kosong.
export function resolveName(raw: string) {
  const n = raw.trim().toLowerCase();
  if (!n) return "";
  const s = STUDENTS.find(
    (x) => x.full.toLowerCase() === n || x.short.toLowerCase() === n || x.full.toLowerCase().startsWith(n + " ")
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
