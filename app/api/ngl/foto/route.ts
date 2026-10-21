import { NextResponse } from "next/server";
import { can } from "@/lib/admins";
import { currentUser } from "@/lib/auth";
import { getFoto, getState, messagesFor } from "@/lib/ngl";
import { storeReady } from "@/lib/store";

// Foto lampiran pesan NGL: hanya untuk penerimanya (setelah sesi ditutup) atau admin NGL.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sid = url.searchParams.get("sid") ?? "";
  const id = url.searchParams.get("id") ?? "";
  const to = Number(url.searchParams.get("to") || 0);
  if (!storeReady || !/^s[a-z0-9]{4,20}$/.test(sid) || !/^[0-9a-f-]{36}$/.test(id)) return new NextResponse(null, { status: 404 });
  const user = await currentUser();
  if (!user || user.tempPassword) return new NextResponse(null, { status: 401 });
  const admin = can(user, "ngl");
  const owner = admin && to ? to : user.absen;
  if (!admin) {
    const st = await getState();
    if (st.open && st.current?.id === sid) return new NextResponse(null, { status: 403 }); // belum boleh dibaca
  }
  if (!(await messagesFor(sid, owner)).some((m) => m.id === id && m.foto)) return new NextResponse(null, { status: 404 });
  const img = await getFoto(sid, id).catch(() => null);
  if (!img) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(img.data), { headers: { "Content-Type": img.type, "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" } });
}
