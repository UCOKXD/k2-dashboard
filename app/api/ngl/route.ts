import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { PER_STUDENT, doneBy, getState, listSessions, messagesFor, milestoneReached, pct, reports, studentOf, submit, TOTAL } from "@/lib/ngl";
import { notify } from "@/lib/notify";
import { NOT_READY, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Halaman NGL siswa: status sesi, siapa yang sudah diisi (centang hijau), dan pesan untukku.
// Pesan sesi yang masih buka belum ditampilkan; urutan diacak dan tanpa jam supaya pengirim sulit ditebak.
export async function GET(req: Request) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const [st, sessions, reported] = await Promise.all([getState(), listSessions(), reports()]);
  const reportedIds = new Set(reported.map((r) => r.id));
  const done = st.open && st.current ? await doneBy(st.current.id, user.absen) : [];
  const received = [];
  for (const s of sessions.filter((x) => x.closedAt)) {
    const msgs = await messagesFor(s.id, user.absen);
    received.push({
      sid: s.id,
      openedAt: s.openedAt,
      closedAt: s.closedAt,
      messages: shuffle(msgs).map((m) => ({
        id: m.id,
        from: m.anon ? null : (studentOf(m.from)?.short ?? null),
        apresiasi: m.apresiasi,
        improvement: m.improvement,
        tambahan: m.tambahan,
        reported: reportedIds.has(m.id),
      })),
    });
  }
  return NextResponse.json(
    { open: st.open, sid: st.open ? st.current?.id : null, done, perStudent: PER_STUDENT, received, waiting: st.open },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// Kirim pesan NGL untuk satu teman.
export async function POST(req: Request) {
  const { user, error } = await requireUser(req);
  if (error) return error;
  if (!storeReady) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const r = await submit(user.absen, body ?? {});
  if (typeof r === "string") return NextResponse.json({ error: r }, { status: 400 });
  // Kabari grup saat pengisian melewati 50/70/90/100%.
  const m = await milestoneReached(r.sid, r.count).catch(() => null);
  if (m) await notify("ngl_progres", { persen: String(m), jumlah: String(r.count), total: String(TOTAL), link: "/ngl" }, "Sistem K2 (otomatis)");
  return NextResponse.json({ ok: true, percent: pct(r.count) });
}
