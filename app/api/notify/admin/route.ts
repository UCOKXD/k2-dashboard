import { NextResponse } from "next/server";
import { recordHistory, requireAdmin } from "@/lib/auth";
import { NOTIF_DEF, NOTIF_DEFS, type NotifSettings, type NotifType, isNotifType } from "@/lib/notif";
import { getKeys, getSettings, notify, rotateKeys, saveSettings, status } from "@/lib/notify";
import { NOT_READY, storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";

// Pengaturan notifikasi WhatsApp: khusus Admin Website (berisi kunci Apps Script & bot).
async function guard(req: Request) {
  const r = await requireAdmin(req);
  if (r.error) return r;
  if (!r.user.webAdmin) return { error: NextResponse.json({ error: "Khusus Admin Website" }, { status: 403 }) };
  if (!storeReady) return { error: NextResponse.json({ error: NOT_READY }, { status: 503 }) };
  return r;
}

export async function GET(req: Request) {
  const { error } = await guard(req);
  if (error) return error;
  const [settings, keys, st] = await Promise.all([getSettings(), getKeys(true), status()]);
  // ID spreadsheet jawaban form (dipakai kode Apps Script untuk memasang pemicu, walau script dibuat terpisah).
  return NextResponse.json({ settings, keys, status: st, sheetId: process.env.SHEET_ID ?? "" }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request) {
  const { user, error } = await guard(req);
  if (error) return error;
  const b = (await req.json().catch(() => null)) as Partial<NotifSettings> | null;
  const cur = await getSettings();
  const next: NotifSettings = { ...cur, enabled: { ...cur.enabled }, templates: { ...cur.templates } };
  for (const d of NOTIF_DEFS) {
    const t = d.type as NotifType;
    if (typeof b?.enabled?.[t] === "boolean") next.enabled[t] = b.enabled[t];
    const tpl = b?.templates?.[t];
    if (typeof tpl === "string") next.templates[t] = tpl.trim().slice(0, 1500) || d.template;
  }
  if (typeof b?.interval === "number") next.interval = Math.min(300, Math.max(15, Math.round(b.interval)));
  await saveSettings(next);
  await recordHistory(user, "Mengubah pengaturan notifikasi WhatsApp");
  return NextResponse.json({ ok: true, settings: next });
}

export async function POST(req: Request) {
  const { user, error } = await guard(req);
  if (error) return error;
  const { action, type } = ((await req.json().catch(() => ({}))) ?? {}) as { action?: string; type?: unknown };
  if (action === "test") {
    const ok = await notify("tes", { isi: "Bot notifikasi K2 tersambung." }, user.panggilan);
    return ok ? NextResponse.json({ ok }) : NextResponse.json({ error: "Pesan uji dimatikan atau penyimpanan bermasalah" }, { status: 400 });
  }
  // Kirim contoh satu jenis pesan (data contoh, diberi tanda PESAN UJI) untuk mencoba template di grup.
  if (action === "sample" && isNotifType(type)) {
    const sample = { ...NOTIF_DEF[type].sample, ...(type === "tempat_duduk" ? { link: "/tempat-duduk" } : type === "ulang_tahun" ? { link: "/" } : {}) };
    const ok = await notify(type, sample, user.panggilan, { test: true });
    return ok ? NextResponse.json({ ok }) : NextResponse.json({ error: "Penyimpanan bermasalah" }, { status: 502 });
  }
  if (action === "rotate") {
    const keys = await rotateKeys();
    await recordHistory(user, "Membuat ulang kunci notifikasi WhatsApp (Apps Script & bot perlu diperbarui)");
    return NextResponse.json({ ok: true, keys });
  }
  return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
}
