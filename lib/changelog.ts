// Menjelaskan perubahan admin dengan kalimat yang mudah dibaca untuk Log Aktivitas publik,
// mis. "menambahkan 4 tugas baru: Quiz, ...". Hanya membandingkan data lama vs baru (tanpa efek samping).
import { HARI, type Birthdays, type ContentKey, type GalleryItem, type OrgData, type PelOverrides, type ScheduleItem, type SeatsData, type SlidesData } from "@/lib/content";
import { STUDENTS } from "@/lib/students";
import { jam } from "@/lib/time";
import { DIFFICULTY, type TaskItem } from "@/lib/tasks";

export type ActivityType = ContentKey | "doa-reset";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const tgl = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return y && m && d ? `${d} ${BULAN[m - 1]} ${y}` : ymd;
};
const short = (full: string) => STUDENTS.find((s) => s.full === full)?.short ?? full;
// "Quiz, Presentasi, dan 2 lainnya"
function names(list: string[], max = 3) {
  if (list.length <= max) return list.length > 1 ? `${list.slice(0, -1).join(", ")} dan ${list[list.length - 1]}` : list.join("");
  return `${list.slice(0, max).join(", ")}, dan ${list.length - max} lainnya`;
}
const byId = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));

export const TITLES: Record<ActivityType, string> = {
  org: "Struktur organisasi diperbarui",
  slides: "Foto banner diperbarui",
  gallery: "Galeri kelas diperbarui",
  seats: "Tempat duduk telah di update Admin!",
  pelanggaran: "Data pelanggaran diperbarui admin",
  birthdays: "Data ulang tahun diperbarui",
  schedule: "Jadwal kuliah diperbarui",
  tasks: "Pembaruan tugas",
  "doa-reset": "Riwayat petugas doa direset",
};

const ROLE: [keyof Omit<OrgData, "anggota">, string][] = [
  ["dpp", "DPP"],
  ["komti", "Komti"],
  ["wakomti", "Wakomti"],
  ["bendahara", "Bendahara"],
  ["sekretaris", "Sekretaris"],
  ["koordinator", "Koordinator K2"],
];

// Daftar kalimat perubahan (tanpa subjek). Kosong = tidak ada yang berubah.
export function describe(key: ContentKey, before: unknown, after: unknown, extra: { acak?: boolean } = {}): string[] {
  const out: string[] = [];
  switch (key) {
    case "org": {
      const a = before as OrgData;
      const b = after as OrgData;
      for (const [k, label] of ROLE) if (a[k] !== b[k]) out.push(`mengganti ${label} menjadi ${b[k] ? (k === "dpp" ? b[k] : `${b[k]} (${short(b[k])})`) : "kosong"}`);
      const add = b.anggota.filter((x) => !a.anggota.includes(x));
      const del = a.anggota.filter((x) => !b.anggota.includes(x));
      if (add.length) out.push(`menambahkan anggota K2: ${names(add.map(short))}`);
      if (del.length) out.push(`mengeluarkan dari anggota K2: ${names(del.map(short))}`);
      break;
    }
    case "slides": {
      const a = before as SlidesData;
      const b = after as SlidesData;
      const srcA = a.items.map((x) => x.src);
      const srcB = b.items.map((x) => x.src);
      const add = srcB.filter((s) => !srcA.includes(s)).length;
      const del = srcA.filter((s) => !srcB.includes(s)).length;
      if (add) out.push(`menambahkan ${add} foto banner`);
      if (del) out.push(`menghapus ${del} foto banner`);
      const keptA = srcA.filter((s) => srcB.includes(s));
      const keptB = srcB.filter((s) => srcA.includes(s));
      if (keptA.join() !== keptB.join()) out.push("mengubah urutan foto banner");
      if (a.duration !== b.duration) out.push(`mengubah lama tampil foto banner menjadi ${b.duration} detik`);
      break;
    }
    case "gallery": {
      const a = byId(before as GalleryItem[]);
      const b = after as GalleryItem[];
      const add = b.filter((x) => !a.has(x.id));
      const del = [...a.values()].filter((x) => !b.some((y) => y.id === x.id));
      const cap = b.filter((x) => a.has(x.id) && a.get(x.id)!.caption !== x.caption);
      if (add.length) out.push(`menambahkan ${add.length} foto ke galeri${add.some((x) => x.caption) ? ` (${names(add.filter((x) => x.caption).map((x) => `"${x.caption}"`), 2)})` : ""}`);
      if (del.length) out.push(`menghapus ${del.length} foto dari galeri`);
      if (cap.length) out.push(`mengubah keterangan ${cap.length} foto galeri`);
      break;
    }
    case "seats": {
      const a = (before as SeatsData) ?? { order: [], prio: [] };
      const b = after as NonNullable<SeatsData>;
      const moved = a.order.length ? b.order.filter((st, i) => a.order[i] !== st).length : b.order.length;
      if (extra.acak) out.push("mengacak tempat duduk");
      else if (moved) out.push(`memindahkan ${moved} kursi di denah tempat duduk`);
      const addP = b.prio.filter((x) => !a.prio.includes(x));
      const delP = a.prio.filter((x) => !b.prio.includes(x));
      if (addP.length) out.push(`menetapkan ${names(addP.map((i) => STUDENTS[i]?.short ?? "?"))} wajib duduk paling depan`);
      if (delP.length) out.push(`melepas prioritas duduk depan untuk ${names(delP.map((i) => STUDENTS[i]?.short ?? "?"))}`);
      if (!out.length) out.push("memperbarui denah tempat duduk");
      break;
    }
    case "pelanggaran": {
      const a = before as PelOverrides;
      const b = after as PelOverrides;
      const addedA = byId(a.added);
      const add = b.added.filter((x) => !addedA.has(x.id));
      const del = a.added.filter((x) => !b.added.some((y) => y.id === x.id));
      if (add.length) out.push(`menambahkan ${add.length} catatan pelanggaran: ${names(add.map((x) => `${short(x.nama)} (${x.kat})`), 3)}`);
      if (del.length) out.push(`menghapus ${del.length} catatan pelanggaran`);
      const ids = new Set([...Object.keys(a.edits), ...Object.keys(b.edits)]);
      let hid = 0,
        show = 0,
        changed = 0;
      for (const id of ids) {
        const x = a.edits[id] ?? {};
        const y = b.edits[id] ?? {};
        if (!!x.hidden !== !!y.hidden) {
          if (y.hidden) hid++;
          else show++;
        }
        if (x.kat !== y.kat || x.ket !== y.ket || x.poin !== y.poin) changed++;
      }
      for (const n of b.added) {
        const o = addedA.get(n.id);
        if (o && (o.kat !== n.kat || o.ket !== n.ket || o.poin !== n.poin)) changed++;
      }
      if (changed) out.push(`mengoreksi ${changed} catatan pelanggaran (jenis/keterangan/poin)`);
      if (hid) out.push(`menyembunyikan ${hid} catatan pelanggaran`);
      if (show) out.push(`menampilkan lagi ${show} catatan pelanggaran`);
      const exc = b.hideFromShame.filter((x) => !a.hideFromShame.includes(x));
      const inc = a.hideFromShame.filter((x) => !b.hideFromShame.includes(x));
      if (exc.length) out.push(`mengecualikan ${names(exc.map(short))} dari Hall of Shame`);
      if (inc.length) out.push(`mengikutkan lagi ${names(inc.map(short))} di Hall of Shame`);
      break;
    }
    case "birthdays": {
      const a = before as Birthdays;
      const b = after as Birthdays;
      const add = Object.keys(b).filter((k) => !(k in a));
      const del = Object.keys(a).filter((k) => !(k in b));
      const chg = Object.keys(b).filter((k) => k in a && a[k] !== b[k]);
      if (add.length) out.push(`menambahkan tanggal ulang tahun ${names(add.map(short))}`);
      if (chg.length) out.push(`mengubah tanggal ulang tahun ${names(chg.map(short))}`);
      if (del.length) out.push(`menghapus tanggal ulang tahun ${names(del.map(short))}`);
      break;
    }
    case "schedule": {
      const a = byId(before as ScheduleItem[]);
      const b = after as ScheduleItem[];
      const desc = (s: ScheduleItem) => `${s.matkul} (${HARI[s.day]} ${jam(s.start)}–${jam(s.end)})`;
      const add = b.filter((x) => !a.has(x.id));
      const del = [...a.values()].filter((x) => !b.some((y) => y.id === x.id));
      const chg = b.filter((x) => {
        const o = a.get(x.id);
        return o && JSON.stringify(o) !== JSON.stringify(x);
      });
      if (add.length) out.push(`menambahkan ${add.length} sesi kuliah: ${names(add.map(desc), 2)}`);
      if (chg.length) out.push(`mengubah jadwal ${names(chg.map(desc), 2)}`);
      if (del.length) out.push(`menghapus ${del.length} sesi kuliah: ${names(del.map((s) => s.matkul), 3)}`);
      break;
    }
    case "tasks": {
      const a = byId(before as TaskItem[]);
      const b = after as TaskItem[];
      const add = b.filter((x) => !a.has(x.id));
      const del = [...a.values()].filter((x) => !b.some((y) => y.id === x.id));
      if (add.length)
        out.push(
          `menambahkan ${add.length} tugas baru: ${names(add.map((t) => `${t.judul}${t.matkul ? ` ${t.matkul}` : ""} (deadline ${tgl(t.deadline)}, ${DIFFICULTY[t.difficulty].label})`), 3)}`
        );
      const done = b.filter((x) => a.has(x.id) && !a.get(x.id)!.done && x.done);
      const undone = b.filter((x) => a.has(x.id) && a.get(x.id)!.done && !x.done);
      const moved = b.filter((x) => a.has(x.id) && (a.get(x.id)!.deadline !== x.deadline || a.get(x.id)!.jam !== x.jam));
      const other = b.filter((x) => {
        const o = a.get(x.id);
        return o && (o.judul !== x.judul || o.matkul !== x.matkul || o.difficulty !== x.difficulty || o.catatan !== x.catatan);
      });
      if (moved.length) out.push(`mengubah deadline ${names(moved.map((t) => `${t.judul} menjadi ${tgl(t.deadline)}${t.jam ? ` pukul ${jam(t.jam)}` : ""}`), 2)}`);
      if (done.length) out.push(`menandai selesai: ${names(done.map((t) => t.judul))}`);
      if (undone.length) out.push(`membuka lagi tugas ${names(undone.map((t) => t.judul))}`);
      if (other.length) out.push(`mengubah detail tugas ${names(other.map((t) => t.judul))}`);
      if (del.length) out.push(`menghapus ${del.length} tugas: ${names(del.map((t) => t.judul))}`);
      break;
    }
  }
  return out;
}

// "Ancis (Koordinator K2) menambahkan 4 tugas baru: ...; mengubah deadline ..."
export const sentence = (who: { panggilan: string; jabatan: string }, parts: string[]) => `${who.panggilan} (${who.jabatan}) ${parts.join("; ")}.`;
