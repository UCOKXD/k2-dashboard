import { NextResponse } from "next/server";
import type { NotifType } from "@/lib/notif";
import { getKeys, notify } from "@/lib/notify";
import { TABLES } from "@/lib/sheets";
import { STUDENTS, resolveName } from "@/lib/students";

export const dynamic = "force-dynamic";

// Dipanggil Google Apps Script setiap Google Form dikirim (lihat Panel Admin → Notifikasi WA).
// values = isi baris form sesuai urutan kolom sheet: A = Timestamp, B = Nama Pengisi, C = Kategori Laporan, dst.
const col = (values: string[], letter: string) => (values[letter.charCodeAt(0) - 65] ?? "").toString().trim();
const norm = (s = "") => s.replace(/\s+/g, " ").trim().toLowerCase();

// Kolom tiap jenis laporan (sama dengan yang dipakai halaman web, lihat TABLES di lib/sheets.ts).
const MAP: { type: NotifType; filter: string; fields: Record<string, string> }[] = [
  { type: "pelanggaran", filter: TABLES.pelanggaran.filter, fields: { nama: "D", tanggal: "E", pelanggaran: "F", keterangan: "G" } },
  { type: "izin_tidak_masuk", filter: TABLES.izin.filter, fields: { nama: "H", tanggal: "I", jenis: "J", alasan: "K" } },
  { type: "izin_sakit", filter: TABLES.sakit.filter, fields: { nama: "L", tanggal: "M", keluhan: "N", surat_dokter: "O", catatan: "P" } },
];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { key?: unknown; values?: unknown } | null;
  const keys = await getKeys().catch(() => null);
  if (!keys || typeof body?.key !== "string" || body.key !== keys.form) return NextResponse.json({ error: "Kunci salah" }, { status: 401 });
  if (!Array.isArray(body.values)) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  const values = body.values.slice(0, 40).map((v) => String(v ?? "").slice(0, 500));

  const m = MAP.find((x) => norm(x.filter) === norm(col(values, "C")));
  if (!m) return NextResponse.json({ ok: true, skipped: "kategori tidak dikirim ke grup" });

  const data: Record<string, string> = {};
  for (const [k, letter] of Object.entries(m.fields)) data[k] = col(values, letter);
  data.nama = resolveName(data.nama);
  data.panggilan = STUDENTS.find((s) => s.full === data.nama)?.short ?? data.nama;
  if (m.type === "pelanggaran") data.poin = "1"; // poin awal laporan dari form (bisa diubah admin di web)
  if (m.type === "izin_sakit") data.surat_dokter = data.surat_dokter ? "Ada" : "Tidak ada"; // tautan file tidak ikut dikirim

  const queued = await notify(m.type, data, col(values, "B") || "-", { dedupe: `form|${values.join("|")}` });
  return NextResponse.json({ ok: true, queued });
}
