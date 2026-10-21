import { NextResponse } from "next/server";
import { findAccount } from "@/lib/admins";
import { recordHistory, requireUser } from "@/lib/auth";
import { NOT_READY, storeReady } from "@/lib/store";
import { getUsernames, setUsername, usernameError } from "@/lib/usernames";

// Ganti username sendiri. Mengisi username awal = kembali ke username awal. Lupa? Minta admin mereset (password & username kembali awal).
export async function POST(req: Request) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const { username } = (await req.json().catch(() => ({}))) as { username?: unknown };
  const name = typeof username === "string" ? username.trim() : "";
  const account = findAccount(user.username);
  if (!account) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
  if (name.toLowerCase() === account.username.toLowerCase()) {
    await setUsername(account.key, null);
  } else {
    const e = usernameError(name, account.key, await getUsernames());
    if (e) return NextResponse.json({ error: e }, { status: 400 });
    await setUsername(account.key, name);
  }
  await recordHistory(user, `Mengganti username (${user.login} → ${name})`);
  return NextResponse.json({ ok: true, login: name });
}
