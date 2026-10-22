import { NextResponse } from "next/server";
import { recordHistory, requireAdmin } from "@/lib/auth";
import { EMPTY_INV, cleanInv, type InvData } from "@/lib/inventaris";
import { NOT_READY, getJSON, setJSON, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";
const KEY = "k2:inventaris";

// Inventaris kelas: hanya untuk pengurus dengan izin "inventaris" (bawaannya IT & Logistik) dan Admin Website.
export async function GET(req: Request) {
  const { error } = await requireAdmin(req, { perm: "inventaris", allowTemp: true });
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const data = { ...EMPTY_INV, ...(await getJSON<Partial<InvData>>(KEY, {})) };
  return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request) {
  const { user, error } = await requireAdmin(req, { perm: "inventaris" });
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const d = cleanInv(await req.json().catch(() => null));
  if (typeof d === "string") return NextResponse.json({ error: d }, { status: 400 });
  const before = { ...EMPTY_INV, ...(await getJSON<Partial<InvData>>(KEY, {})) };
  await setJSON(KEY, d);
  const parts: string[] = [];
  const dItems = d.items.length - before.items.length;
  if (dItems > 0) parts.push(`menambah ${dItems} barang`);
  if (dItems < 0) parts.push(`menghapus ${-dItems} barang`);
  const aktif = (x: InvData) => x.loans.filter((l) => !l.kembali).length;
  const dLoan = aktif(d) - aktif(before);
  if (dLoan > 0) parts.push(`mencatat ${dLoan} peminjaman`);
  if (dLoan < 0) parts.push(`menandai ${-dLoan} barang kembali`);
  await recordHistory(user, `Inventaris: ${parts.join(", ") || "memperbarui data barang"}`);
  return NextResponse.json({ data: d });
}
