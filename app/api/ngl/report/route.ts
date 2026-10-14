import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { report } from "@/lib/ngl";

export const dynamic = "force-dynamic";

// Penerima melaporkan pesan yang tidak pantas; admin NGL meninjaunya di Panel Admin.
export async function POST(req: Request) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  const { sid, id } = ((await req.json().catch(() => ({}))) ?? {}) as { sid?: unknown; id?: unknown };
  if (typeof sid !== "string" || typeof id !== "string") return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  const err = await report(user.absen, sid, id);
  return err ? NextResponse.json({ error: err }, { status: 404 }) : NextResponse.json({ ok: true });
}
