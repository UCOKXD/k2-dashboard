import { NextResponse } from "next/server";
import { recordHistory, requireAdmin } from "@/lib/auth";
import { KEEP_MAX, KEEP_MIN, closeSession, deleteMessage, deleteSession, dismissReport, getKeepDays, getState, listSessions, messagesFor, openSession, pct, progress, reports, setKeepDays, studentOf } from "@/lib/ngl";
import { notify } from "@/lib/notify";
import { NOT_READY, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

const who = (absen: number) => {
  const s = studentOf(absen);
  return s ? { absen, nama: s.full, panggilan: s.short } : { absen, nama: "?", panggilan: "?" };
};

// Admin NGL (izin "ngl"): status sesi, progres, laporan. ?sid=&to= → semua pesan untuk satu siswa beserta pengirim asli.
export async function GET(req: Request) {
  const { error } = await requireAdmin(req, { perm: "ngl" });
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const url = new URL(req.url);
  const sid = url.searchParams.get("sid");
  const to = Number(url.searchParams.get("to"));
  if (sid && studentOf(to)) {
    const msgs = await messagesFor(sid, to);
    return NextResponse.json({ messages: msgs.map((m) => ({ ...m, sender: who(m.from) })) });
  }
  const [state, sessions, reps, keepDays] = await Promise.all([getState(), listSessions(), reports(), getKeepDays()]);
  const target = state.current ?? sessions[0] ?? null;
  const items = [];
  for (const r of reps) {
    const m = (await messagesFor(r.sid, r.to)).find((x) => x.id === r.id);
    if (m) items.push({ ...r, message: m, sender: who(m.from), recipient: who(m.to) });
    else await dismissReport(r.id); // pesannya sudah terhapus (dihapus admin / lewat 3 bulan)
  }
  return NextResponse.json(
    { state, sessions, keepDays, progress: target ? { sid: target.id, ...(await progress(target.id)) } : null, reports: items },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const { user, error } = await requireAdmin(req, { perm: "ngl" });
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const b = ((await req.json().catch(() => ({}))) ?? {}) as { action?: string; sid?: string; to?: number; id?: string; days?: number };
  if (b.action === "open") {
    const s = await openSession(user.panggilan);
    if (typeof s === "string") return NextResponse.json({ error: s }, { status: 400 });
    await recordHistory(user, "Membuka sesi NGL baru");
    await notify("ngl_buka", { link: "/ngl" }, user.panggilan);
    return NextResponse.json({ ok: true });
  }
  if (b.action === "close") {
    const r = await closeSession(user.panggilan);
    if (typeof r === "string") return NextResponse.json({ error: r }, { status: 400 });
    await recordHistory(user, `Menutup sesi NGL (${r.count} pesan, ${pct(r.count)}% terisi)`);
    await notify("ngl_tutup", { jumlah: String(r.count), persen: String(pct(r.count)), link: "/ngl" }, user.panggilan);
    return NextResponse.json({ ok: true });
  }
  if (b.action === "delete" && typeof b.sid === "string" && typeof b.id === "string" && studentOf(Number(b.to))) {
    const m = await deleteMessage(b.sid, Number(b.to), b.id);
    if (!m) return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });
    await recordHistory(user, `Menghapus pesan NGL untuk ${studentOf(m.to)?.short} dari ${studentOf(m.from)?.short}`);
    return NextResponse.json({ ok: true });
  }
  if (b.action === "delete-session" && typeof b.sid === "string") {
    const e = await deleteSession(b.sid);
    if (e) return NextResponse.json({ error: e }, { status: 400 });
    await recordHistory(user, "Menghapus sesi NGL beserta semua pesannya");
    return NextResponse.json({ ok: true });
  }
  if (b.action === "keep") {
    const d = Number(b.days);
    if (!Number.isInteger(d) || d < KEEP_MIN || d > KEEP_MAX) return NextResponse.json({ error: `Isi ${KEEP_MIN}–${KEEP_MAX} hari` }, { status: 400 });
    const r = await setKeepDays(d);
    await recordHistory(user, `Mengatur pesan NGL dihapus otomatis ${d} hari setelah sesi ditutup${r.deleted ? ` (${r.deleted} sesi lama langsung terhapus)` : ""}`);
    return NextResponse.json({ ok: true, deleted: r.deleted });
  }
  if (b.action === "dismiss" && typeof b.id === "string") {
    await dismissReport(b.id);
    await recordHistory(user, "Mengabaikan laporan pesan NGL");
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
}
