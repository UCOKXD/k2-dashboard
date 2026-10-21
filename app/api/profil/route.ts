import { NextResponse } from "next/server";
import { recordHistory, requireUser } from "@/lib/auth";
import { BIO_MAX, IG_RE, LI_RE, TT_RE, saveInfo } from "@/lib/profile";
import { NOT_READY, storeReady } from "@/lib/store";

// Simpan bio, Instagram, TikTok & LinkedIn profil sendiri.
export async function PUT(req: Request) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as { bio?: unknown; ig?: unknown; showIg?: unknown; tt?: unknown; showTt?: unknown; li?: unknown; showLi?: unknown };
  const bio = typeof b.bio === "string" ? b.bio.replace(/\r/g, "").trim() : "";
  const ig = typeof b.ig === "string" ? b.ig.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "") : "";
  const tt = typeof b.tt === "string" ? b.tt.trim().replace(/^https?:\/\/(www\.|m\.)?tiktok\.com\//i, "").replace(/^@/, "").replace(/[/?].*$/, "") : "";
  if ([...bio].length > BIO_MAX) return NextResponse.json({ error: `Bio maksimal ${BIO_MAX} karakter` }, { status: 400 });
  if ((bio.match(/\n/g) ?? []).length > 4) return NextResponse.json({ error: "Bio maksimal 5 baris" }, { status: 400 });
  if (ig && !IG_RE.test(ig)) return NextResponse.json({ error: "Username Instagram tidak valid" }, { status: 400 });
  const li = typeof b.li === "string" ? b.li.trim().replace(/^https?:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/in\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "") : "";
  if (li && !LI_RE.test(li)) return NextResponse.json({ error: "Link/username LinkedIn tidak valid (contoh: linkedin.com/in/nama-kamu)" }, { status: 400 });
  if (tt && !TT_RE.test(tt)) return NextResponse.json({ error: "Username TikTok tidak valid" }, { status: 400 });
  await saveInfo(user.absen, { bio, ig, showIg: !!ig && b.showIg === true, tt, showTt: !!tt && b.showTt === true, li, showLi: !!li && b.showLi === true });
  await recordHistory(user, "Memperbarui profil (bio/media sosial)");
  return NextResponse.json({ ok: true });
}
