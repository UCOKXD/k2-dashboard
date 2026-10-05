// Membaca konten admin dari Redis (dengan nilai awal kalau belum ada / Redis belum dipasang). Hanya untuk server.
import { CONTENT, type ActivityLog, type ContentKey, type ContentOf } from "@/lib/content";
import { getJSON, listJSON } from "@/lib/store";

export function getContent<K extends ContentKey>(k: K): Promise<ContentOf<K>> {
  return getJSON(CONTENT[k].key, CONTENT[k].fallback as ContentOf<K>);
}

export function getActivity(): Promise<ActivityLog[]> {
  return listJSON<ActivityLog>("k2:log", 100);
}
