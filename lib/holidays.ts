// Hari libur nasional & cuti bersama Indonesia, sesuai SKB 3 Menteri (sumber: setneg.go.id).
// Tahun yang SKB-nya belum terbit hanya berisi libur bertanggal tetap. Tambahkan tahun baru di sini setiap SKB terbit.
export type Holiday = { date: string; name: string; cuti?: boolean }; // date = "YYYY-MM-DD"

const L = (date: string, name: string): Holiday => ({ date, name });
const C = (date: string, name: string): Holiday => ({ date, name, cuti: true });

const SKB: Record<number, Holiday[]> = {
  2026: [
    L("2026-01-01", "Tahun Baru 2026 Masehi"),
    L("2026-01-16", "Isra Mikraj Nabi Muhammad saw."),
    C("2026-02-16", "Cuti Bersama Tahun Baru Imlek"),
    L("2026-02-17", "Tahun Baru Imlek 2577 Kongzili"),
    C("2026-03-18", "Cuti Bersama Hari Suci Nyepi"),
    L("2026-03-19", "Hari Suci Nyepi (Tahun Baru Saka 1948)"),
    C("2026-03-20", "Cuti Bersama Idulfitri"),
    L("2026-03-21", "Idulfitri 1447 H"),
    L("2026-03-22", "Idulfitri 1447 H"),
    C("2026-03-23", "Cuti Bersama Idulfitri"),
    C("2026-03-24", "Cuti Bersama Idulfitri"),
    L("2026-04-03", "Wafat Yesus Kristus"),
    L("2026-04-05", "Kebangkitan Yesus Kristus (Paskah)"),
    L("2026-05-01", "Hari Buruh Internasional"),
    L("2026-05-14", "Kenaikan Yesus Kristus"),
    C("2026-05-15", "Cuti Bersama Kenaikan Yesus Kristus"),
    L("2026-05-27", "Iduladha 1447 H"),
    C("2026-05-28", "Cuti Bersama Iduladha"),
    L("2026-05-31", "Hari Raya Waisak 2570 BE"),
    L("2026-06-01", "Hari Lahir Pancasila"),
    L("2026-06-16", "1 Muharam Tahun Baru Islam 1448 H"),
    L("2026-08-17", "Proklamasi Kemerdekaan"),
    L("2026-08-25", "Maulid Nabi Muhammad saw."),
    C("2026-12-24", "Cuti Bersama Natal"),
    L("2026-12-25", "Kelahiran Yesus Kristus (Natal)"),
  ],
  2027: [
    L("2027-01-01", "Tahun Baru 2027 Masehi"),
    L("2027-01-05", "Isra Mikraj Nabi Muhammad saw."),
    C("2027-02-05", "Cuti Bersama Tahun Baru Imlek"),
    L("2027-02-06", "Tahun Baru Imlek 2578 Kongzili"),
    L("2027-03-08", "Hari Suci Nyepi (Tahun Baru Saka 1949)"),
    C("2027-03-09", "Cuti Bersama Idulfitri"),
    L("2027-03-10", "Idulfitri 1448 H"),
    L("2027-03-11", "Idulfitri 1448 H"),
    C("2027-03-12", "Cuti Bersama Idulfitri"),
    C("2027-03-15", "Cuti Bersama Idulfitri"),
    C("2027-03-25", "Cuti Bersama Wafat Yesus Kristus"),
    L("2027-03-26", "Wafat Yesus Kristus"),
    L("2027-03-28", "Kebangkitan Yesus Kristus (Paskah)"),
    L("2027-05-01", "Hari Buruh Internasional"),
    L("2027-05-06", "Kenaikan Yesus Kristus"),
    L("2027-05-17", "Iduladha 1448 H"),
    C("2027-05-18", "Cuti Bersama Iduladha"),
    C("2027-05-19", "Cuti Bersama Waisak"),
    L("2027-05-20", "Hari Raya Waisak 2571 BE"),
    L("2027-06-01", "Hari Lahir Pancasila"),
    L("2027-06-06", "1 Muharam Tahun Baru Islam 1449 H"),
    L("2027-08-15", "Maulid Nabi Muhammad saw."),
    L("2027-08-17", "Proklamasi Kemerdekaan"),
    C("2027-12-24", "Cuti Bersama Natal"),
    L("2027-12-25", "Kelahiran Yesus Kristus (Natal)"),
    L("2027-12-26", "Isra Mikraj Nabi Muhammad saw."),
  ],
};

// Libur yang tanggalnya selalu sama, dipakai untuk tahun yang SKB-nya belum ada.
const FIXED: [string, string][] = [
  ["01-01", "Tahun Baru Masehi"],
  ["05-01", "Hari Buruh Internasional"],
  ["06-01", "Hari Lahir Pancasila"],
  ["08-17", "Proklamasi Kemerdekaan"],
  ["12-25", "Kelahiran Yesus Kristus (Natal)"],
];

export function hasSkb(year: number) {
  return year in SKB;
}

export function holidaysOf(year: number): Holiday[] {
  return SKB[year] ?? FIXED.map(([md, name]) => L(`${year}-${md}`, name));
}
