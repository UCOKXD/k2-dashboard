import { NextResponse } from "next/server";
import { changePassword, clearSessionCookie, recordHistory, requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  const { user, error } = await requireUser(req, { allowTemp: true });
  if (error) return error;
  const { oldPassword, newPassword } = (await req.json().catch(() => ({}))) as { oldPassword?: string; newPassword?: string };
  if (typeof oldPassword !== "string" || typeof newPassword !== "string") return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  const err = await changePassword(user.username, oldPassword, newPassword.slice(0, 100));
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  if (user.admin) await recordHistory(user, "Mengganti password");
  // Sesi lama tidak berlaku lagi; minta masuk ulang dengan password baru.
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
