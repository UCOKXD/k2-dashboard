import { NextResponse } from "next/server";
import { findAdmin } from "@/lib/admins";
import { TEMP_PASSWORD, recordHistory, requireAdmin } from "@/lib/auth";
import { NOT_READY, cmd, storeReady } from "@/lib/store";

const CAN_RESET = ["Komti", "Koordinator K2"];

// Kembalikan password admin lain ke password sementara (untuk yang lupa password).
export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  if (!CAN_RESET.includes(user.jabatan)) return NextResponse.json({ error: "Hanya Komti dan Koordinator K2 yang bisa mereset password" }, { status: 403 });
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const { username } = (await req.json().catch(() => ({}))) as { username?: string };
  const target = typeof username === "string" ? findAdmin(username) : undefined;
  if (!target) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
  if (target.username === user.username) return NextResponse.json({ error: "Untuk akun sendiri, pakai Ganti password" }, { status: 400 });
  await cmd("DEL", `k2:pw:${target.username.toLowerCase()}`);
  await cmd("DEL", `k2:fail:${target.username.toLowerCase()}`);
  await recordHistory(user, `Mereset password ${target.panggilan} ke password sementara`);
  return NextResponse.json({ ok: true, temp: TEMP_PASSWORD });
}
