import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { recordHistory, requireAdmin } from "@/lib/auth";
import { describe, sentence, TITLES } from "@/lib/changelog";
import { CONTENT, type ActivityLog, type ContentKey, type GalleryItem, type OrgData, type PelOverrides, type ScheduleItem, type SeatsData, type SlidesData } from "@/lib/content";
import { getContent } from "@/lib/content-server";
import { DEFAULT_ORDER, valid } from "@/lib/seats";
import type { TaskItem } from "@/lib/tasks";
import { NOT_READY, cmd, pushJSON, setJSON, storeReady } from "@/lib/store";
import { STUDENTS } from "@/lib/students";

export const dynamic = "force-dynamic";

const isKey = (k: string): k is ContentKey => k in CONTENT;
const names = new Set(STUDENTS.map((s) => s.full));
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const student = (v: unknown) => (typeof v === "string" && names.has(v) ? v : "");
const mediaSrc = (v: unknown) => (typeof v === "string" && (/^\/api\/media\/[a-z0-9-]{8,40}$/.test(v) || /^\/slides\/[\w.-]+$/.test(v)) ? v : "");

// Bersihkan & periksa isi kiriman tiap jenis konten. Mengembalikan [data, ringkasan riwayat] atau pesan error.
function clean(key: ContentKey, b: unknown): [unknown, string] | string {
  const o = (b ?? {}) as Record<string, unknown>;
  switch (key) {
    case "org": {
      const anggota = Array.isArray(o.anggota) ? o.anggota.slice(0, 6).map(student).filter(Boolean) : [];
      const d: OrgData = {
        dpp: str(o.dpp, 80),
        komti: student(o.komti),
        wakomti: student(o.wakomti),
        bendahara: student(o.bendahara),
        sekretaris: student(o.sekretaris),
        koordinator: student(o.koordinator),
        anggota,
      };
      return [d, "Mengubah struktur organisasi"];
    }
    case "slides": {
      const items = Array.isArray(o.items) ? o.items.slice(0, 12).flatMap((x) => {
        const it = x as Record<string, unknown>;
        const src = mediaSrc(it.src);
        return src ? [{ id: str(it.id, 40) || src, src }] : [];
      }) : [];
      if (!items.length) return "Minimal harus ada 1 foto";
      const duration = Math.min(60, Math.max(3, Math.round(Number(o.duration) || 8)));
      const d: SlidesData = { duration, items };
      return [d, `Mengubah foto banner (${items.length} foto, ${duration} detik)`];
    }
    case "gallery": {
      const list = Array.isArray(b) ? b.slice(0, 300) : [];
      const d: GalleryItem[] = list.flatMap((x) => {
        const it = x as Record<string, unknown>;
        const src = mediaSrc(it.src);
        return src ? [{ id: str(it.id, 40), src, caption: str(it.caption, 140), at: str(it.at, 40), by: str(it.by, 40) }] : [];
      });
      return [d, `Memperbarui galeri (${d.length} foto)`];
    }
    case "seats": {
      const order = Array.isArray(o.order) ? o.order.map(Number) : [];
      const prio = Array.isArray(o.prio) ? [...new Set(o.prio.map(Number))].filter((i) => STUDENTS[i]) : [];
      const okOrder = order.length === DEFAULT_ORDER.length && new Set(order).size === order.length && order.every((i) => STUDENTS[i]);
      if (!okOrder) return "Susunan tempat duduk tidak valid";
      if (!valid(order, prio)) return "Nama prioritas harus duduk paling depan";
      const d: SeatsData = { order, prio };
      return [d, "Memperbarui tempat duduk"];
    }
    case "pelanggaran": {
      const edits: PelOverrides["edits"] = {};
      for (const [id, v] of Object.entries((o.edits ?? {}) as Record<string, Record<string, unknown>>).slice(0, 2000)) {
        const e: PelOverrides["edits"][string] = {};
        if (str(v.kat)) e.kat = str(v.kat, 80);
        if (str(v.ket)) e.ket = str(v.ket, 300);
        if (v.poin !== undefined && Number.isFinite(Number(v.poin))) e.poin = Math.min(100, Math.max(0, Math.round(Number(v.poin))));
        if (v.hidden) e.hidden = true;
        if (Object.keys(e).length) edits[id.slice(0, 200)] = e;
      }
      const added: PelOverrides["added"] = (Array.isArray(o.added) ? o.added : []).slice(0, 1000).flatMap((x) => {
        const a = x as Record<string, unknown>;
        const nama = student(a.nama);
        const tanggal = /^\d{4}-\d{2}-\d{2}$/.test(str(a.tanggal)) ? str(a.tanggal) : "";
        if (!nama || !tanggal || !str(a.kat)) return [];
        return [{ id: str(a.id, 40), nama, kat: str(a.kat, 80), ket: str(a.ket, 300), tanggal, poin: Math.min(100, Math.max(0, Math.round(Number(a.poin) || 1))) }];
      });
      const hideFromShame = (Array.isArray(o.hideFromShame) ? o.hideFromShame : []).map(student).filter(Boolean);
      return [{ edits, added, hideFromShame } satisfies PelOverrides, "Mengubah data pelanggaran / Hall of Shame"];
    }
    case "birthdays": {
      const d: Record<string, string> = {};
      for (const [k, v] of Object.entries(o)) if (names.has(k) && /^\d{2}-\d{2}$/.test(String(v))) d[k] = String(v);
      return [d, `Mengubah data ulang tahun (${Object.keys(d).length} siswa)`];
    }
    case "schedule": {
      const list = Array.isArray(b) ? b.slice(0, 80) : [];
      const time = (v: unknown) => (/^\d{2}:\d{2}$/.test(String(v)) ? String(v) : "");
      const d: ScheduleItem[] = list.flatMap((x) => {
        const it = x as Record<string, unknown>;
        const day = Math.round(Number(it.day));
        const start = time(it.start);
        const end = time(it.end);
        const matkul = str(it.matkul, 80);
        if (!(day >= 1 && day <= 6) || !start || !end || !matkul) return [];
        return [{ id: str(it.id, 40), day, start, end, matkul, ruang: str(it.ruang, 40), dosen: str(it.dosen, 80) }];
      });
      return [d, `Mengubah jadwal kuliah (${d.length} sesi)`];
    }
    case "tasks": {
      const list = Array.isArray(b) ? b.slice(0, 200) : [];
      const d: TaskItem[] = list.flatMap((x) => {
        const it = x as Record<string, unknown>;
        const judul = str(it.judul, 100);
        const deadline = /^\d{4}-\d{2}-\d{2}$/.test(str(it.deadline)) ? str(it.deadline) : "";
        if (!judul || !deadline) return [];
        const diff = Math.round(Number(it.difficulty));
        return [{
          id: str(it.id, 40),
          judul,
          matkul: str(it.matkul, 80),
          deadline,
          jam: /^\d{2}:\d{2}$/.test(str(it.jam)) ? str(it.jam) : "",
          difficulty: (diff === 1 || diff === 3 ? diff : 2) as TaskItem["difficulty"],
          catatan: str(it.catatan, 300),
          done: !!it.done,
        }];
      });
      return [d, `Memperbarui daftar tugas (${d.length} tugas)`];
    }
  }
}

const PAGES: Record<ContentKey, string[]> = {
  org: ["/"],
  slides: ["/"],
  gallery: ["/galeri"],
  seats: ["/tempat-duduk", "/"],
  pelanggaran: ["/", "/pelanggaran"],
  birthdays: ["/", "/kalender-acara"],
  schedule: ["/", "/jadwal", "/kalender-acara"],
  tasks: ["/kalender-acara"],
};

export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isKey(key)) return NextResponse.json({ error: "Tidak dikenal" }, { status: 404 });
  return NextResponse.json({ data: await getContent(key), stored: storeReady });
}

export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isKey(key)) return NextResponse.json({ error: "Tidak dikenal" }, { status: 404 });
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });

  const body = await req.json().catch(() => null);
  const r = clean(key, body);
  if (typeof r === "string") return NextResponse.json({ error: r }, { status: 400 });
  const at = new Date().toISOString();
  const [raw] = r;
  const data = key === "seats" ? { ...(raw as object), at, by: user.panggilan } : raw;

  try {
    // Bandingkan dengan data sebelumnya untuk Log Aktivitas publik: siapa mengubah apa.
    const before = await getContent(key);
    const parts = describe(key, before, data, { acak: !!(body as { acak?: unknown } | null)?.acak });
    await setJSON(CONTENT[key].key, data);
    if (key === "gallery" || key === "slides") await dropUnusedMedia();
    if (parts.length) {
      const detail = sentence(user, parts);
      await recordHistory(user, detail);
      await pushJSON("k2:log", { type: key, title: TITLES[key], detail, at, by: user.panggilan } satisfies ActivityLog, 200);
      revalidatePath("/");
    }
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 502 });
  }
  for (const p of PAGES[key]) revalidatePath(p);
  return NextResponse.json({ ok: true, data });
}

// Hapus foto yang sudah tidak dipakai di banner maupun galeri supaya penyimpanan tidak penuh.
async function dropUnusedMedia() {
  const [slides, gallery] = await Promise.all([getContent("slides"), getContent("gallery")]);
  const used = new Set([...slides.items, ...gallery].map((x) => x.src.split("/").pop()));
  const all = await cmd<string[]>("SMEMBERS", "k2:media:all");
  const unused = all.filter((id) => !used.has(id));
  for (const id of unused) {
    await cmd("DEL", `k2:media:${id}`);
    await cmd("SREM", "k2:media:all", id);
  }
}
