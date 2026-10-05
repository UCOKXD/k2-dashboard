import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import type { HistoryItem } from "@/lib/content";
import { listJSON, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

// Riwayat perubahan admin (siapa mengubah apa). Hanya untuk admin.
export async function GET(req: Request) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  return NextResponse.json({ stored: storeReady, items: await listJSON<HistoryItem>("k2:history", 300) });
}
