import { NextResponse } from "next/server";
import { TABLES, getTable } from "@/lib/sheets";

export async function GET(_: Request, { params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (!(tab in TABLES)) return NextResponse.json({ error: "Tab tidak dikenal" }, { status: 404 });
  try {
    return NextResponse.json(await getTable(tab as keyof typeof TABLES));
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 502 });
  }
}
