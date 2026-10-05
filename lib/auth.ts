// Login admin: password di-hash (scrypt) di Redis, sesi berupa cookie yang ditandatangani (HMAC). Hanya untuk server.
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type Admin, type SessionUser, findAdmin } from "@/lib/admins";
import { NOT_READY, cmd, pushJSON, storeReady } from "@/lib/store";

export const TEMP_PASSWORD = "1234#"; // password awal semua admin sampai diganti
const COOKIE = "k2_session";
const MAX_AGE = 7 * 24 * 3600; // 7 hari
const MAX_FAIL = 5;
const LOCK_SECONDS = 10 * 60;

// Kunci tanda tangan sesi. AUTH_SECRET disarankan; kalau tidak ada, pakai rahasia server lain yang sudah ada.
function secret() {
  const s = process.env.AUTH_SECRET || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.GOOGLE_API_KEY;
  if (!s) throw new Error("AUTH_SECRET belum diatur");
  return createHash("sha256").update(`k2-auth:${s}`).digest();
}

const pwKey = (u: string) => `k2:pw:${u.toLowerCase()}`;

function eq(a: Buffer | string, b: Buffer | string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

async function storedHash(username: string): Promise<string | null> {
  if (!storeReady) return null;
  return cmd<string | null>("GET", pwKey(username));
}

function hashPassword(pw: string) {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("base64")}$${scryptSync(pw, salt, 32).toString("base64")}`;
}

function checkHash(pw: string, stored: string) {
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  return eq(scryptSync(pw, Buffer.from(salt, "base64"), 32), Buffer.from(hash, "base64"));
}

// Versi password: berubah setiap ganti password, sehingga sesi lama otomatis tidak berlaku.
const pwVersion = (stored: string | null) => createHash("sha256").update(stored ?? "temp").digest("base64url").slice(0, 12);

/* ------------------------------------------------------- Batas salah password */

const memFails = new Map<string, { n: number; until: number }>(); // cadangan kalau Redis belum ada

async function lockedFor(username: string): Promise<number> {
  const k = `k2:fail:${username.toLowerCase()}`;
  if (storeReady) {
    const n = Number((await cmd<string | null>("GET", k)) ?? 0);
    return n >= MAX_FAIL ? Math.max(1, await cmd<number>("TTL", k)) : 0;
  }
  const m = memFails.get(k);
  return m && m.n >= MAX_FAIL && m.until > Date.now() ? Math.ceil((m.until - Date.now()) / 1000) : 0;
}

async function addFail(username: string) {
  const k = `k2:fail:${username.toLowerCase()}`;
  if (storeReady) {
    const n = await cmd<number>("INCR", k);
    if (n === 1) await cmd("EXPIRE", k, LOCK_SECONDS);
    return n;
  }
  const m = memFails.get(k);
  const next = m && m.until > Date.now() ? { n: m.n + 1, until: m.until } : { n: 1, until: Date.now() + LOCK_SECONDS * 1000 };
  memFails.set(k, next);
  return next.n;
}

async function clearFails(username: string) {
  const k = `k2:fail:${username.toLowerCase()}`;
  if (storeReady) await cmd("DEL", k);
  else memFails.delete(k);
}

/* ------------------------------------------------------------------ Sesi */

function sign(payload: object) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${createHmac("sha256", secret()).update(body).digest("base64url")}`;
}

function unsign(token: string): { u: string; exp: number; pv: string } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (!eq(sig, createHmac("sha256", secret()).update(body).digest("base64url"))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    return p.exp > Date.now() / 1000 ? p : null;
  } catch {
    return null;
  }
}

function toUser(a: Admin, stored: string | null): SessionUser {
  return { username: a.username, nama: a.nama, panggilan: a.panggilan, jabatan: a.jabatan, grup: a.grup, tempPassword: !stored };
}

export async function login(username: string, password: string): Promise<{ user?: SessionUser; error?: string; token?: string }> {
  const admin = findAdmin(username);
  const wait = await lockedFor(username || "-");
  if (wait) return { error: `Terlalu banyak percobaan salah. Coba lagi dalam ${Math.ceil(wait / 60)} menit.` };

  const stored = admin ? await storedHash(admin.username) : null;
  const ok = admin && (stored ? checkHash(password, stored) : eq(password, TEMP_PASSWORD));
  if (!admin || !ok) {
    const n = await addFail(username || "-");
    const left = MAX_FAIL - n;
    return { error: left > 0 ? `Username atau password salah. Sisa ${left} percobaan.` : "Terlalu banyak percobaan salah. Coba lagi dalam 10 menit." };
  }
  await clearFails(username);
  const token = sign({ u: admin.username, exp: Math.floor(Date.now() / 1000) + MAX_AGE, pv: pwVersion(stored) });
  return { user: toUser(admin, stored), token };
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

// Admin yang sedang login (atau null). Dipakai di route API.
export async function currentAdmin(): Promise<(SessionUser & { admin: Admin }) | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const p = unsign(token);
  const admin = p && findAdmin(p.u);
  if (!p || !admin) return null;
  let stored: string | null = null;
  try {
    stored = await storedHash(admin.username);
  } catch {
    return null;
  }
  if (p.pv !== pwVersion(stored)) return null;
  return { ...toUser(admin, stored), admin };
}

export async function changePassword(username: string, oldPw: string, newPw: string): Promise<string | null> {
  if (!storeReady) return NOT_READY;
  const admin = findAdmin(username);
  if (!admin) return "Akun tidak ditemukan";
  const stored = await storedHash(admin.username);
  const ok = stored ? checkHash(oldPw, stored) : eq(oldPw, TEMP_PASSWORD);
  if (!ok) return "Password lama salah";
  if (newPw.length < 6) return "Password baru minimal 6 karakter";
  if (newPw === TEMP_PASSWORD) return "Password baru tidak boleh sama dengan password sementara";
  await cmd("SET", pwKey(admin.username), hashPassword(newPw));
  return null;
}

/* --------------------------------------------- Penjaga untuk route API admin */

// Tolak permintaan ubah data dari situs lain (cookie sameSite=lax sudah menahan, ini lapisan tambahan).
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function requireAdmin(req: Request) {
  if (!sameOrigin(req)) return { error: NextResponse.json({ error: "Permintaan ditolak" }, { status: 403 }) };
  const user = await currentAdmin();
  if (!user) return { error: NextResponse.json({ error: "Silakan masuk sebagai admin dulu" }, { status: 401 }) };
  return { user };
}

// Riwayat semua perubahan admin (hanya terlihat di panel admin).
export async function recordHistory(user: SessionUser, action: string) {
  if (!storeReady) return;
  try {
    await pushJSON("k2:history", { at: new Date().toISOString(), by: user.panggilan, jabatan: user.jabatan, action });
  } catch {}
}
