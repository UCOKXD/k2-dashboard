import { NextResponse } from "next/server";
import { cmd, storeReady } from "@/lib/store";

// Foto yang diunggah admin. ID tidak pernah dipakai ulang, jadi boleh di-cache lama.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!storeReady || !/^[a-z0-9-]{8,40}$/.test(id)) return new NextResponse(null, { status: 404 });
  const raw = await cmd<string | null>("GET", `k2:media:${id}`).catch(() => null);
  if (!raw) return new NextResponse(null, { status: 404 });
  const [type, b64] = raw.split(";");
  return new NextResponse(Buffer.from(b64, "base64"), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
