import { NextResponse } from "next/server";
import { login, recordHistory, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = (await req.json().catch(() => ({}))) as { username?: string; password?: string };
  if (typeof username !== "string" || typeof password !== "string" || !username || !password)
    return NextResponse.json({ error: "Isi username dan password" }, { status: 400 });
  try {
    // Vercel mengisi x-real-ip / x-forwarded-for dengan IP asli pengunjung (tidak bisa dipalsukan dari browser).
    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const r = await login(username.slice(0, 40), password.slice(0, 100), ip.slice(0, 64));
    if (!r.user || !r.token) return NextResponse.json({ error: r.error }, { status: 401 });
    const res = NextResponse.json({ user: r.user });
    setSessionCookie(res, r.token);
    await recordHistory(r.user, "Masuk ke panel admin");
    return res;
  } catch {
    return NextResponse.json({ error: "Login sedang bermasalah, coba lagi" }, { status: 500 });
  }
}
