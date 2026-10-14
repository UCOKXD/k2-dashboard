// NGL kelas: pesan apresiasi & area improvement untuk teman sekelas (anonim atau pakai panggilan). Hanya untuk server.
//
// - Sesi dibuka/ditutup admin (izin "ngl"). Sesi baru = centang hijau mulai dari nol lagi.
// - Satu pesan per pengirim → penerima per sesi (tidak bisa diubah/diisi ulang).
// - Pesan sesi yang masih buka belum bisa dibaca penerima; baru terbuka setelah sesi ditutup.
// - Pesan disimpan 3 bulan setelah sesinya ditutup, lalu terhapus otomatis.
// - Pengirim asli tetap tercatat (admin NGL boleh melihatnya untuk menangani laporan).
import { randomUUID } from "node:crypto";
import { STUDENTS } from "@/lib/students";
import { cmd, getJSON, setJSON } from "@/lib/store";

const STATE = "k2:ngl:state";
const SESSIONS = "k2:ngl:sessions";
const REPORTS = "k2:ngl:reports";
const KEEP = 90 * 86_400; // 3 bulan setelah sesi ditutup
const WHILE_OPEN = 200 * 86_400; // selama sesi masih buka (dipendekkan jadi 3 bulan saat ditutup)

export const NGL_MIN = 10;
export const NGL_MAX = 500;
export const N = STUDENTS.length;
export const PER_STUDENT = N - 1; // tiap siswa mengisi untuk semua teman kecuali dirinya
export const TOTAL = N * PER_STUDENT;
export const MILESTONES = [50, 70, 90, 100];

export type NglSession = { id: string; openedAt: string; openedBy: string; closedAt?: string; closedBy?: string };
type State = { open: boolean; current: NglSession | null };
export type NglMessage = { id: string; from: number; to: number; anon: boolean; apresiasi: string; improvement: string; tambahan: string; at: string };
export type NglReport = { sid: string; id: string; to: number; at: string };

const inKey = (sid: string, absen: number) => `k2:ngl:${sid}:in:${absen}`; // pesan untuk siswa ini
const doneKey = (sid: string, absen: number) => `k2:ngl:${sid}:done:${absen}`; // nomor absen yang sudah diisi siswa ini
const countKey = (sid: string) => `k2:ngl:${sid}:count`;
const msKey = (sid: string, m: number) => `k2:ngl:${sid}:ms:${m}`;

export const studentOf = (absen: number) => STUDENTS.find((s) => s.absen === absen);

export async function getState(): Promise<State> {
  return getJSON<State>(STATE, { open: false, current: null });
}

// Sesi 3 bulan terakhir (terbaru di depan). Sesi yang lebih lama dibuang dari daftar.
export async function listSessions(): Promise<NglSession[]> {
  const all = await getJSON<NglSession[]>(SESSIONS, []);
  const limit = Date.now() - KEEP * 1000;
  return all.filter((s) => !s.closedAt || Date.parse(s.closedAt) > limit);
}

export async function openSession(by: string): Promise<NglSession | string> {
  const st = await getState();
  if (st.open) return "Sesi NGL sudah dibuka";
  const s: NglSession = { id: `s${Date.now().toString(36)}`, openedAt: new Date().toISOString(), openedBy: by };
  await setJSON(SESSIONS, [s, ...(await listSessions())]);
  await setJSON(STATE, { open: true, current: s } satisfies State);
  return s;
}

export async function closeSession(by: string): Promise<{ session: NglSession; count: number } | string> {
  const st = await getState();
  if (!st.open || !st.current) return "Belum ada sesi NGL yang dibuka";
  const s: NglSession = { ...st.current, closedAt: new Date().toISOString(), closedBy: by };
  await setJSON(SESSIONS, (await listSessions()).map((x) => (x.id === s.id ? s : x)));
  await setJSON(STATE, { open: false, current: s } satisfies State);
  // Mulai hitung 3 bulan dari sekarang untuk semua data sesi ini.
  for (const x of STUDENTS) {
    await cmd("EXPIRE", inKey(s.id, x.absen), KEEP);
    await cmd("EXPIRE", doneKey(s.id, x.absen), KEEP);
  }
  await cmd("EXPIRE", countKey(s.id), KEEP);
  return { session: s, count: await countOf(s.id) };
}

export async function countOf(sid: string) {
  return Number((await cmd<string | null>("GET", countKey(sid))) ?? 0);
}

export async function doneBy(sid: string, absen: number): Promise<number[]> {
  return (await cmd<string[]>("SMEMBERS", doneKey(sid, absen))).map(Number).sort((a, b) => a - b);
}

const clean = (v: unknown) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : "");

// Kirim satu pesan. Mengembalikan pesan error, atau { count } = jumlah pesan sesi ini setelah pesan masuk.
export async function submit(from: number, body: Record<string, unknown>): Promise<{ count: number; sid: string } | string> {
  const st = await getState();
  if (!st.open || !st.current) return "Sesi NGL sedang ditutup";
  const sid = st.current.id;
  const to = Number(body.to);
  if (!studentOf(to) || to === from) return "Penerima tidak valid";
  const apresiasi = clean(body.apresiasi);
  const improvement = clean(body.improvement);
  const tambahan = clean(body.tambahan);
  if (apresiasi.length < NGL_MIN || improvement.length < NGL_MIN) return `Apresiasi dan Area Improvement minimal ${NGL_MIN} karakter`;
  if ([apresiasi, improvement, tambahan].some((x) => x.length > NGL_MAX)) return `Tiap kotak maksimal ${NGL_MAX} karakter`;

  // SADD mengembalikan 0 kalau sudah ada: satu pesan per pasangan per sesi, aman walau dikirim bersamaan.
  const added = await cmd<number>("SADD", doneKey(sid, from), to);
  if (!added) return "Kamu sudah mengisi untuk teman ini";
  const msg: NglMessage = { id: randomUUID(), from, to, anon: body.anon !== false, apresiasi, improvement, tambahan, at: new Date().toISOString() };
  await cmd("RPUSH", inKey(sid, to), JSON.stringify(msg));
  const count = await cmd<number>("INCR", countKey(sid));
  await cmd("EXPIRE", doneKey(sid, from), WHILE_OPEN);
  await cmd("EXPIRE", inKey(sid, to), WHILE_OPEN);
  await cmd("EXPIRE", countKey(sid), WHILE_OPEN);
  return { count, sid };
}

// Persen yang baru saja terlewati (50/70/90/100), masing-masing hanya sekali per sesi.
export async function milestoneReached(sid: string, count: number): Promise<number | null> {
  const before = Math.floor(((count - 1) * 100) / TOTAL);
  const now = Math.floor((count * 100) / TOTAL);
  const m = [...MILESTONES].reverse().find((x) => before < x && now >= x);
  if (!m) return null;
  const first = await cmd<string | null>("SET", msKey(sid, m), "1", "NX", "EX", WHILE_OPEN);
  return first === "OK" ? m : null;
}

const parse = (raw: string): NglMessage | null => {
  try {
    return JSON.parse(raw) as NglMessage;
  } catch {
    return null;
  }
};

export async function messagesFor(sid: string, absen: number): Promise<NglMessage[]> {
  return (await cmd<string[]>("LRANGE", inKey(sid, absen), 0, -1)).map(parse).filter((m): m is NglMessage => !!m);
}

export async function reports(): Promise<NglReport[]> {
  return (await cmd<string[]>("LRANGE", REPORTS, 0, -1)).map((r) => JSON.parse(r) as NglReport);
}

// Penerima melaporkan pesan yang tidak pantas (masuk ke admin NGL untuk ditinjau).
export async function report(absen: number, sid: string, id: string): Promise<string | null> {
  const msgs = await messagesFor(sid, absen);
  if (!msgs.some((m) => m.id === id)) return "Pesan tidak ditemukan";
  if ((await reports()).some((r) => r.id === id)) return null;
  await cmd("RPUSH", REPORTS, JSON.stringify({ sid, id, to: absen, at: new Date().toISOString() } satisfies NglReport));
  return null;
}

export async function dismissReport(id: string) {
  for (const r of await cmd<string[]>("LRANGE", REPORTS, 0, -1)) if ((JSON.parse(r) as NglReport).id === id) await cmd("LREM", REPORTS, 0, r);
}

// Admin menghapus pesan (mis. setelah laporan). Centang pengirim tetap (tidak bisa mengisi ulang).
export async function deleteMessage(sid: string, to: number, id: string): Promise<NglMessage | null> {
  for (const raw of await cmd<string[]>("LRANGE", inKey(sid, to), 0, -1)) {
    const m = parse(raw);
    if (m?.id === id) {
      await cmd("LREM", inKey(sid, to), 1, raw);
      await dismissReport(id);
      return m;
    }
  }
  return null;
}

// Progres per siswa (berapa teman yang sudah diisi). Tidak membuka isi pesan.
export async function progress(sid: string) {
  const students = [];
  for (const s of STUDENTS) students.push({ absen: s.absen, done: Number(await cmd<number>("SCARD", doneKey(sid, s.absen))) });
  return { count: await countOf(sid), total: TOTAL, perStudent: PER_STUDENT, students };
}

export const pct = (count: number) => Math.floor((count * 100) / TOTAL);
