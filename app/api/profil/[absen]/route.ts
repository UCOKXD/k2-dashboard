import { NextResponse } from "next/server";
import { accountsFor } from "@/lib/admins";
import { requireUser } from "@/lib/auth";
import { getAvatarMap } from "@/lib/avatars";
import { getContent } from "@/lib/content-server";
import { buildPelanggaran } from "@/lib/dashboard";
import { EMPTY_PROFILE, getProfile } from "@/lib/profile";
import { getTable } from "@/lib/sheets";
import { storeReady } from "@/lib/store";
import { STUDENTS, resolveName } from "@/lib/students";
import { getUsernames, loginOf } from "@/lib/usernames";

export const dynamic = "force-dynamic";

// Profil satu siswa untuk siswa yang sudah masuk: info, foto, bio, Instagram, TikTok & LinkedIn (kalau ditampilkan), dan jumlah izin/sakit/pelanggaran.
export async function GET(req: Request, { params }: { params: Promise<{ absen: string }> }) {
  const { user, error } = await requireUser(req, { allowTemp: true });
  if (error) return error;
  const absen = Number((await params).absen);
  const s = STUDENTS.find((x) => x.absen === absen);
  if (!s) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });

  const [org, izin, sakit, pelT, ov] = await Promise.all([getContent("org"), getTable("izin").catch(() => null), getTable("sakit").catch(() => null), getTable("pelanggaran").catch(() => null), getContent("pelanggaran")]);
  const acc = accountsFor(org).find((a) => a.absen === absen);
  const [profile, avatars, names] = storeReady
    ? await Promise.all([getProfile(absen), getAvatarMap().catch(() => ({})), getUsernames().catch(() => ({}))])
    : [EMPTY_PROFILE, {}, {}];
  const count = (t: Awaited<ReturnType<typeof getTable>> | null) => (t ? t.rows.filter((r) => resolveName(r[t.name] ?? "") === s.full).length : null);
  const pel = pelT ? buildPelanggaran(pelT, ov).students.find((x) => x.nama === s.full) : undefined;
  const own = user.absen === absen;

  return NextResponse.json(
    {
      absen,
      nama: s.full,
      panggilan: s.short,
      jabatan: acc?.jabatan ?? "Siswa",
      login: acc ? loginOf(acc, names) : null,
      avatar: (avatars as Record<string, number>)[absen] ?? null,
      bio: profile.bio,
      ig: profile.showIg || own ? profile.ig : "",
      showIg: profile.showIg,
      tt: profile.showTt || own ? profile.tt : "",
      showTt: profile.showTt,
      li: profile.showLi || own ? profile.li : "",
      showLi: profile.showLi,
      posts: profile.posts,
      stats: { izin: count(izin), sakit: count(sakit), pelanggaran: pelT ? (pel?.kasus ?? 0) : null, poin: pelT ? (pel?.jumlah ?? 0) : null },
      own,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
