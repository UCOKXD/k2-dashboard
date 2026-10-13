// Membaca konten admin dari Redis (dengan nilai awal kalau belum ada / Redis belum dipasang). Hanya untuk server.
import { CONTENT, normOrg, type ActivityLog, type ContentKey, type ContentOf, type OrgData } from "@/lib/content";
import { getJSON, listJSON } from "@/lib/store";

export async function getContent<K extends ContentKey>(k: K): Promise<ContentOf<K>> {
  const v = await getJSON(CONTENT[k].key, CONTENT[k].fallback as ContentOf<K>);
  // Struktur lama (hanya BPH & K2) otomatis dilengkapi divisi lain & izin bawaan.
  return (k === "org" ? normOrg(v as OrgData) : v) as ContentOf<K>;
}

export function getActivity(): Promise<ActivityLog[]> {
  return listJSON<ActivityLog>("k2:log", 100);
}
