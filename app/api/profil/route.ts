import { NextResponse } from "next/server";
import { recordHistory, requireUser } from "@/lib/auth";
import { BIO_MAX, IG_RE, saveInfo } from "@/lib/profile";
import { NOT_READY, storeReady } from "@/lib/store";

// Simpan bio & Instagram profil sendiri.
export async function PUT(req: Request) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as { bio?: unknown; ig?: unknown; showIg?: unknown };
  const bio = typeof b.bio === "string" ? b.bio.replace(/\r/g, "").trim() : "";
  const ig = typeof b.ig === "string" ? b.ig.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "") : "";
  if ([...bio].length > BIO_MAX) return NextResponse.json({ error: `Bio maksimal ${BIO_MAX} karakter` }, { status: 400 });
  if ((bio.match(/\n/g) ?? []).length > 4) return NextResponse.json({ error: "Bio maksimal 5 baris" }, { status: 400 });
  if (ig && !IG_RE.test(ig)) return NextResponse.json({ error: "Username Instagram tidak valid" }, { status: 400 });
  await saveInfo(user.absen, { bio, ig, showIg: !!ig && b.showIg === true });
  await recordHistory(user, "Memperbarui profil (bio/Instagram)");
  return NextResponse.json({ ok: true });
}
