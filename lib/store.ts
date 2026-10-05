// Penyimpanan kecil di Upstash Redis (lewat REST, tanpa library). Hanya dipakai di server.
// Pasang integrasi "Upstash for Redis" di Vercel, variabelnya terisi otomatis.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const storeReady = Boolean(REDIS_URL && TOKEN);

// Tanpa opsi cache: di route API selalu baru, di halaman utama (ISR 30 detik) dibaca ulang tiap regenerasi.
async function cmd<T>(...args: (string | number)[]): Promise<T> {
  if (!storeReady) throw new Error("Penyimpanan belum dipasang");
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  return ((await res.json()) as { result: T }).result;
}

/* ------------------------------------------------------------ Doa harian */

export type DoaPick = { name: string; nim: string; at: string }; // at = ISO waktu acak

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
