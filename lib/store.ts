// Penyimpanan kecil di Upstash Redis (lewat REST, tanpa library). Hanya dipakai di server.
// Pasang integrasi "Upstash for Redis" di Vercel, variabelnya terisi otomatis.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const storeReady = Boolean(REDIS_URL && TOKEN);
export const NOT_READY = "Penyimpanan (Upstash Redis) belum dipasang di Vercel, jadi perubahan belum bisa disimpan.";

// Tanpa opsi cache: di route API selalu baru, di halaman (ISR 30 detik) dibaca ulang tiap regenerasi.
export async function cmd<T>(...args: (string | number)[]): Promise<T> {
  if (!storeReady) throw new Error(NOT_READY);
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  return ((await res.json()) as { result: T }).result;
}

/* ------------------------------------------------------------ Dokumen JSON */

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  if (!storeReady) return fallback;
  try {
    const raw = await cmd<string | null>("GET", key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setJSON(key: string, value: unknown) {
  await cmd("SET", key, JSON.stringify(value));
}

// Daftar JSON terbaru di depan, dipotong supaya tidak membengkak.
export async function pushJSON(key: string, value: unknown, max = 300) {
  await cmd("LPUSH", key, JSON.stringify(value));
  await cmd("LTRIM", key, 0, max - 1);
}

export async function listJSON<T>(key: string, count = 300): Promise<T[]> {
  if (!storeReady) return [];
  try {
    const raw = await cmd<string[]>("LRANGE", key, 0, count - 1);
    return raw.flatMap((s) => {
      try {
        return [JSON.parse(s) as T];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------ Doa harian */

// at = ISO waktu acak, by = panggilan admin, manual = ditambahkan admin di luar acak (sudah berdoa sebelumnya)
export type DoaPick = { name: string; nim: string; at: string; by?: string; manual?: boolean };

// Bulan berjalan di zona Jakarta, mis. "2026-10".
export function monthId(offset = 0) {
  const n = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const d = new Date(n.getFullYear(), n.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const doaKey = (m: string) => `k2:doa:${m}`;

export async function getDoaPicks(month = monthId()): Promise<DoaPick[]> {
  const raw = await cmd<string[]>("LRANGE", doaKey(month), 0, -1);
  return raw.flatMap((s) => {
    try {
      return [JSON.parse(s) as DoaPick];
    } catch {
      return [];
    }
  });
}

export async function addDoaPick(p: DoaPick) {
  await cmd("RPUSH", doaKey(monthId()), JSON.stringify(p));
}

export async function resetDoaPicks() {
  await cmd("DEL", doaKey(monthId()));
}

// Untuk log aktivitas: acak bulan ini + bulan lalu (supaya 14 hari terakhir tetap lengkap di awal bulan).
export async function recentDoaPicks(): Promise<DoaPick[]> {
  if (!storeReady) return [];
  try {
    const [prev, cur] = await Promise.all([getDoaPicks(monthId(-1)), getDoaPicks()]);
    return [...prev, ...cur];
  } catch {
    return [];
  }
}
