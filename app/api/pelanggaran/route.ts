import { NextResponse } from "next/server";
import { buildPelanggaran } from "@/lib/dashboard";
import { getContent } from "@/lib/content-server";
import { getTable } from "@/lib/sheets";

export const dynamic = "force-dynamic";

// Data pelanggaran siap tampil (sheet + koreksi admin), dipakai halaman utama untuk pembaruan berkala.
export async function GET() {
  try {
    const [t, ov] = await Promise.all([getTable("pelanggaran"), getContent("pelanggaran")]);
    return NextResponse.json({ data: buildPelanggaran(t, ov) });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 502 });
  }
}
