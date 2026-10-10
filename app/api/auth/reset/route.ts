import { NextResponse } from "next/server";
import { accountsFor, findAccount, isAdminAccount } from "@/lib/admins";
import { changedAccounts, initialPassword, recordHistory, requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content-server";
import { NOT_READY, cmd, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

const CAN_RESET = ["Komti", "Koordinator K2"]; // ditambah Admin Website

// Daftar semua akun dengan peran terbaru (dari Struktur), status ganti password, dan ada/tidaknya tanggal lahir.
export async function GET(req: Request) {
  const { error } = await requireAdmin(req, { allowTemp: true });
  if (error) return error;
  const [org, birthdays] = await Promise.all([getContent("org"), getContent("birthdays")]);
  const list = accountsFor(org);
  const changed = await changedAccounts(list.map((a) => a.username)).catch(() => new Set<string>());
  return NextResponse.json({
    items: list.map((a) => ({
      username: a.username,
      jabatan: a.jabatan,
      grup: a.grup,
      webAdmin: a.webAdmin,
      changed: changed.has(a.username),
      birthday: isAdminAccount(a) || !!birthdays[a.nama], // admin masih bisa memakai password sementara
    })),
  });
}

// Kembalikan password akun lain ke password awal (untuk yang lupa password).
export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;
  if (!user.webAdmin && !CAN_RESET.includes(user.jabatan))
    return NextResponse.json({ error: "Hanya Admin Website, Komti, dan Koordinator K2 yang bisa mereset password" }, { status: 403 });
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const { username } = (await req.json().catch(() => ({}))) as { username?: string };
  const target = typeof username === "string" ? findAccount(username, await getContent("org")) : undefined;
  if (!target) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
  if (target.username === user.username) return NextResponse.json({ error: "Untuk akun sendiri, pakai Ganti password" }, { status: 400 });
  if (target.webAdmin) return NextResponse.json({ error: "Password Admin Website tidak bisa direset dari sini" }, { status: 403 });
  await cmd("DEL", `k2:pw:${target.username.toLowerCase()}`);
  await cmd("DEL", `k2:fail:${target.username.toLowerCase()}`);
  await recordHistory(user, `Mereset password ${target.panggilan} (${target.username}) ke password awal`);
  return NextResponse.json({ ok: true, temp: await initialPassword(target), admin: isAdminAccount(target) });
}
