// Logika denah tempat duduk (aman dipakai di server maupun browser).
import { STUDENTS } from "@/lib/students";

// Grid 11 kolom sesuai denah: kiri = kolom 1-3 (2 baris), kolom 4 = lorong, kanan = kolom 5-11 (4 baris).
// Baris 1 = Papan & Dosen, baris 2-5 = kursi.
export const SEATS = [
  ...Array.from({ length: 6 }, (_, i) => ({ r: 2 + Math.floor(i / 3), c: 1 + (i % 3) })),
  ...Array.from({ length: 28 }, (_, i) => ({ r: 2 + Math.floor(i / 7), c: 5 + (i % 7) })),
];

// Susunan awal = denah yang sekarang dipakai (dibaca per baris, kiri lalu kanan).
export const DEFAULT_ORDER = (
  "Justine Tegar Ancis Yere Calvin Carol " +
  "Maria Edward Tasya Samuel Celine Michael Dea " +
  "Alex Ina Naren Sasa Aloy Tania Bryan " +
  "Davita Fahri Eve Grady Kallista Joevans William " +
  "Teguh Zaqi Adit Diipa Radin Tiop Rizky"
)
  .split(" ")
  .map((s) => STUDENTS.findIndex((x) => x.short === s));

export function shuffle<T>(arr: T[]) {
  const a = [...arr]; // Fisher-Yates
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Aturan prioritas: baris terdepan diisi PENUH oleh nama prioritas dulu, sisanya di baris berikutnya.
// full = kursi yang wajib berisi nama prioritas; partial = baris tempat sisa nama prioritas (boleh campur).
export function frontRows(count: number) {
  const full = new Set<number>();
  const partial = new Set<number>();
  let left = count;
  for (let row = 2; row <= 5 && left > 0; row++) {
    const seats = SEATS.flatMap((p, i) => (p.r === row ? [i] : []));
    if (left >= seats.length) seats.forEach((i) => full.add(i));
    else seats.forEach((i) => partial.add(i));
    left -= seats.length;
  }
  return { full, partial, zone: new Set([...full, ...partial]) };
}

// Susunan sah: semua kursi "full" berisi prioritas, dan semua prioritas duduk di zona depan.
export function valid(order: number[], prio: number[]) {
  const { full, zone } = frontRows(prio.length);
  return [...full].every((seat) => prio.includes(order[seat])) && prio.every((st) => zone.has(order.indexOf(st)));
}

// Rapikan susunan dengan pindahan sesedikit mungkin supaya memenuhi aturan prioritas.
export function ensureFront(order: number[], prio: number[]) {
  const { full, partial, zone } = frontRows(prio.length);
  const a = [...order];
  const isP = (seat: number) => prio.includes(a[seat]);
  const swap = (x: number, y: number) => ([a[x], a[y]] = [a[y], a[x]]);
  // 1. Kursi "full" yang masih diisi nama biasa: tukar dengan prioritas yang duduk di luar kursi "full".
  for (const seat of full) {
    if (isP(seat)) continue;
    const from = a.findIndex((st, i) => prio.includes(st) && !full.has(i));
    if (from >= 0) swap(seat, from);
  }
  // 2. Prioritas yang masih di luar zona depan: pindah ke kursi baris sisa yang diisi nama biasa.
  for (const st of prio) {
    const at = a.indexOf(st);
    if (zone.has(at)) continue;
    const free = [...partial].find((seat) => !isP(seat));
    if (free !== undefined) swap(at, free);
  }
  return a;
}

// Acak semua kursi dengan tetap mematuhi aturan prioritas.
export function shuffleWithFront(prio: number[]) {
  const { full, partial } = frontRows(prio.length);
  const pr = shuffle(prio);
  const rest = shuffle(STUDENTS.map((_, i) => i).filter((i) => !prio.includes(i)));
  const order = new Array<number>(SEATS.length);
  for (const seat of full) order[seat] = pr.pop()!;
  const partialSeats = shuffle([...partial]);
  partialSeats.forEach((seat) => (order[seat] = pr.length ? pr.pop()! : rest.pop()!));
  SEATS.forEach((_, seat) => {
    if (order[seat] === undefined) order[seat] = rest.pop()!;
  });
  return order;
}

