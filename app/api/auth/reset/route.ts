import { NextResponse } from "next/server";
import { accountsFor, findAccount } from "@/lib/admins";
import { changedAccounts, initialPassword, recordHistory, requireAdmin, usesTempPassword } from "@/lib/auth";
import { getContent } from "@/lib/content-server";
import { NOT_READY, cmd, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

// Daftar semua akun dengan peran terbaru (dari Struktur & Peran), status ganti password,
// dan apakah password awalnya sudah bisa dipakai (tanggal lahir sudah ada / admin lama dengan password sementara).
export async function GET(req: Request) {
  const { error } = await requireAdmin(req, { allowTemp: true, perm: "akun" });
  if (error) return error;
  const [org, birthdays] = await Promise.all([getContent("org"), getContent("birthdays")]);
  const list = accountsFor(org);
  const changed = await changedAccounts(list.map((a) => a.key)).catch(() => new Set<string>());
  return NextResponse.json({
    items: list.map((a) => ({
      username: a.username,
      jabatan: a.jabatan,
      grup: a.grup,
      admin: a.admin,
      webAdmin: a.webAdmin,
      changed: changed.has(a.key),
      birthday: usesTempPassword(a) || !!birthdays[a.nama],
    })),
  });
}

// Kembalikan password akun lain ke password awal (untuk yang lupa password).
export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req, { perm: "akun" });
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const { username } = (await req.json().catch(() => ({}))) as { username?: string };
  const target = typeof username === "string" ? findAccount(username, await getContent("org")) : undefined;
  if (!target) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
  if (target.username === user.username) return NextResponse.json({ error: "Untuk akun sendiri, pakai Ganti password" }, { status: 400 });
  if (target.webAdmin) return NextResponse.json({ error: "Password Admin Website tidak bisa direset dari sini" }, { status: 403 });
  await cmd("DEL", `k2:pw:${target.key}`);
  await cmd("DEL", `k2:fail:${target.key}`);
  await recordHistory(user, `Mereset password ${target.panggilan} (${target.username}) ke password awal`);
  return NextResponse.json({ ok: true, temp: await initialPassword(target), admin: target.admin });
}
