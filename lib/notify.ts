// Antrian notifikasi WhatsApp di Upstash Redis. Hanya untuk server.
// Web/Apps Script memanggil notify() → event masuk antrian → bot di laptop mengambil lewat /api/notify/pull
// (pesan sudah dirakit di sini), mengirim ke grup, lalu konfirmasi lewat /api/notify/ack.
// Bot hanya memegang kunci bot, bukan akses Upstash.
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NOTIF_DEF, type NotifSettings, type NotifType, defaultSettings, fmtWib, isNotifType, render } from "@/lib/notif";
import { todayJkt } from "@/lib/acara";
import { cmd, getJSON, setJSON, storeReady } from "@/lib/store";

const Q = "k2:notif:q";
const SETTINGS = "k2:notif:settings";
const KEYS = "k2:notif:keys";
const SEEN = "k2:notif:seen"; // bot terakhir mengecek antrian
const LOG = "k2:notif:log";
const MAX_QUEUE = 500;
const PER_MESSAGE = 10; // maksimal laporan dalam satu pesan rangkuman

export type QItem = {
  id: string;
  type: NotifType;
  data: Record<string, string>;
  by: string; // dilaporkan oleh
  at: string; // waktu laporan (ISO), dicatat saat laporan masuk ke web
  expires?: string; // lewat dari ini tidak dikirim (mis. petugas doa kemarin)
  collapse?: string; // event dengan kunci sama yang menumpuk: hanya yang terbaru dikirim
};
export type NotifLog = { at: string; type: NotifType; n: number; preview: string; skipped?: boolean };
export type NotifKeys = { form: string; bot: string };

export async function getSettings(): Promise<NotifSettings> {
  const d = defaultSettings();
  const s = await getJSON<Partial<NotifSettings>>(SETTINGS, {});
  return {
    enabled: { ...d.enabled, ...s.enabled },
    templates: { ...d.templates, ...s.templates },
    interval: s.interval ?? d.interval,
  };
}
export const saveSettings = (s: NotifSettings) => setJSON(SETTINGS, s);

// Kunci untuk Apps Script (form) dan bot. Dibuat otomatis saat pertama dibutuhkan.
export async function getKeys(create = false): Promise<NotifKeys | null> {
  // Pakai cmd langsung (bukan getJSON) supaya gangguan Redis sesaat tidak dikira "belum ada kunci" lalu menimpa kunci lama.
  const raw = await cmd<string | null>("GET", KEYS);
  if (raw) return JSON.parse(raw) as NotifKeys;
  return create ? rotateKeys() : null;
}
export async function rotateKeys(): Promise<NotifKeys> {
  const k = { form: randomBytes(18).toString("base64url"), bot: randomBytes(24).toString("base64url") };
  await setJSON(KEYS, k);
  return k;
}

// Akhir hari ini (WIB) — untuk event yang hanya berlaku hari ini.
export function endOfTodayWib() {
  return new Date(`${todayJkt()}T23:59:59+07:00`).toISOString();
}

// Masukkan event ke antrian. dedupe: kunci unik supaya event yang terkirim dua kali hanya dicatat sekali.
export async function notify(
  type: NotifType,
  data: Record<string, string>,
  by: string,
  opts: { expires?: string; collapse?: string; dedupe?: string } = {},
): Promise<boolean> {
  if (!storeReady) return false;
  try {
    const s = await getSettings();
    if (!s.enabled[type]) return false;
    if (opts.dedupe) {
      const first = await cmd<string | null>("SET", `k2:notif:dedupe:${createHash("sha256").update(opts.dedupe).digest("base64url").slice(0, 24)}`, "1", "NX", "EX", 7 * 86_400);
      if (first !== "OK") return false;
    }
    const item: QItem = { id: randomUUID(), type, data, by: by || "-", at: new Date().toISOString(), ...(opts.expires ? { expires: opts.expires } : {}), ...(opts.collapse ? { collapse: opts.collapse } : {}) };
    const n = await cmd<number>("RPUSH", Q, JSON.stringify(item));
    if (n > MAX_QUEUE) await cmd("LTRIM", Q, -MAX_QUEUE, -1); // bot lama mati: buang yang paling lama
    return true;
  } catch {
    return false; // notifikasi tidak boleh menggagalkan penyimpanan data utama
  }
}

const parse = (raw: string): QItem | null => {
  try {
    const x = JSON.parse(raw) as QItem;
    return isNotifType(x.type) ? x : null;
  } catch {
    return null;
  }
};

export type OutMessage = { ids: string[]; type: NotifType; text: string };

// Rakit pesan dari antrian: yang kedaluwarsa/dimatikan dibuang, kunci collapse disisakan yang terbaru,
// lalu event sejenis yang menumpuk digabung jadi satu pesan rangkuman.
export function compose(items: QItem[], s: NotifSettings, origin: string): { messages: OutMessage[]; drop: QItem[] } {
  const now = Date.now();
  const drop: QItem[] = [];
  const live: QItem[] = [];
  for (const it of items) {
    if ((it.expires && Date.parse(it.expires) < now) || !s.enabled[it.type]) drop.push(it);
    else live.push(it);
  }
  // collapse: id event lama ikut dikonfirmasi bersama event terbaru (tidak dikirim terpisah).
  const latest = new Map<string, QItem>();
  for (const it of live) if (it.collapse) latest.set(it.collapse, it);
  const extraIds = new Map<string, string[]>();
  const kept = live.filter((it) => {
    if (!it.collapse) return true;
    const last = latest.get(it.collapse)!;
    if (last === it) return true;
    extraIds.set(last.id, [...(extraIds.get(last.id) ?? []), it.id]);
    return false;
  });

  const groups = new Map<NotifType, QItem[]>();
  for (const it of kept) groups.set(it.type, [...(groups.get(it.type) ?? []), it]);

  const text = (it: QItem) =>
    render(s.templates[it.type], {
      ...it.data,
      link: it.data.link?.startsWith("/") ? `${origin}${it.data.link}` : (it.data.link ?? ""),
      dilaporkan_oleh: it.by,
      waktu_laporan: fmtWib(it.at),
    });

  const messages: OutMessage[] = [];
  for (const [type, list] of groups) {
    for (let i = 0; i < list.length; i += PER_MESSAGE) {
      const part = list.slice(i, i + PER_MESSAGE);
      const ids = part.flatMap((it) => [it.id, ...(extraIds.get(it.id) ?? [])]);
      const body = part.map(text).join("\n\n— — —\n\n");
      messages.push({ ids, type, text: list.length > 1 ? `📋 *${list.length} ${NOTIF_DEF[type].plural}*\n\n${body}` : body });
    }
  }
  return { messages, drop };
}

export async function botSeen(): Promise<string | null> {
  return cmd<string | null>("GET", SEEN);
}

// Dipanggil bot. Antrian kosong = hanya 2 perintah Redis (hemat kuota gratis Upstash).
export async function pull(origin: string) {
  await cmd("SET", SEEN, new Date().toISOString(), "EX", 30 * 86_400);
  const raw = await cmd<string[]>("LRANGE", Q, 0, 99);
  if (!raw.length) return { messages: [] as OutMessage[] };
  const s = await getSettings();
  const items = raw.map(parse);
  // Data rusak dibuang supaya antrian tidak macet.
  for (let i = 0; i < raw.length; i++) if (!items[i]) await cmd("LREM", Q, 1, raw[i]);
  const ok = items.filter((x): x is QItem => !!x);
  const { messages, drop } = compose(ok, s, origin);
  if (drop.length) await removeItems(drop.map((d) => d.id), drop.map((d) => ({ type: d.type, n: 1, preview: "Dilewati (kedaluwarsa/dimatikan)", skipped: true })));
  return { messages, interval: s.interval };
}

async function removeItems(ids: string[], logs: Omit<NotifLog, "at">[]) {
  const want = new Set(ids);
  const raw = await cmd<string[]>("LRANGE", Q, 0, 199);
  for (const r of raw) {
    const it = parse(r);
    if (it && want.has(it.id)) await cmd("LREM", Q, 1, r);
  }
  const at = new Date().toISOString();
  for (const l of logs) await cmd("LPUSH", LOG, JSON.stringify({ at, ...l } satisfies NotifLog));
  if (logs.length) await cmd("LTRIM", LOG, 0, 49);
}

// Bot sudah mengirim pesan: hapus dari antrian dan catat di riwayat.
export async function ack(ids: string[], type: NotifType, preview: string) {
  await removeItems(ids, [{ type, n: ids.length, preview: preview.slice(0, 160) }]);
}

export async function status() {
  const [seen, length, log] = await Promise.all([
    botSeen(),
    cmd<number>("LLEN", Q),
    cmd<string[]>("LRANGE", LOG, 0, 29).then((l) => l.map((x) => JSON.parse(x) as NotifLog)),
  ]);
  return { seen, length, log };
}

// Pemeriksa kunci bot dari header "Authorization: Bearer <kunci>".
export async function isBot(req: Request) {
  const keys = await getKeys().catch(() => null);
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return !!keys && got.length > 0 && got === keys.bot;
}
