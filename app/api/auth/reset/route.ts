import { NextResponse } from "next/server";
import { ACCOUNTS, findAccount, isAdminAccount } from "@/lib/admins";
import { changedAccounts, initialPassword, recordHistory, requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content-server";
import { NOT_READY, cmd, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

const CAN_RESET = ["Komti", "Koordinator K2"];

// Daftar semua akun: sudah ganti password awal atau belum, dan apakah tanggal lahir (untuk password awal siswa) sudah ada.
export async function GET(req: Request) {
  const { error } = await requireAdmin(req, { allowTemp: true });
  if (error) return error;
  const [changed, birthdays] = await Promise.all([changedAccounts(ACCOUNTS.map((a) => a.username)).catch(() => new Set<string>()), getContent("birthdays")]);
  return NextResponse.json({
    items: ACCOUNTS.map((a) => ({ username: a.username, changed: changed.has(a.username), birthday: isAdminAccount(a) || !!birthdays[a.nama] })),
  });
}

// Kembalikan password akun lain ke password awal (untuk yang lupa password).
export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  if (!CAN_RESET.includes(user.jabatan)) return NextResponse.json({ error: "Hanya Komti dan Koordinator K2 yang bisa mereset password" }, { status: 403 });
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const { username } = (await req.json().catch(() => ({}))) as { username?: string };
  const target = typeof username === "string" ? findAccount(username) : undefined;
  if (!target) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
  if (target.username === user.username) return NextResponse.json({ error: "Untuk akun sendiri, pakai Ganti password" }, { status: 400 });
  await cmd("DEL", `k2:pw:${target.username.toLowerCase()}`);
  await cmd("DEL", `k2:fail:${target.username.toLowerCase()}`);
  await recordHistory(user, `Mereset password ${target.panggilan} (${target.username}) ke password awal`);
  return NextResponse.json({ ok: true, temp: await initialPassword(target) });
}
