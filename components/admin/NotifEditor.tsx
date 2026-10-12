"use client";
import { useEffect, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw, Send } from "lucide-react";
import { adminFetch } from "@/components/AuthProvider";
import { Loading, Panel, SaveBar, input, smallBtn } from "@/components/admin/ui";
import { NOTIF_DEF, NOTIF_DEFS, type NotifSettings, type NotifType, fmtWib, render } from "@/lib/notif";

type Log = { at: string; type: NotifType; n: number; preview: string; skipped?: boolean };
type Data = { settings: NotifSettings; keys: { form: string; bot: string }; status: { seen: string | null; length: number; log: Log[] }; now: number };

const REPO = "https://github.com/UCOKXD/k2-dashboard/tree/main/bot";

function ago(iso: string, now: number) {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return `${s} detik lalu`;
  if (s < 3600) return `${Math.round(s / 60)} menit lalu`;
  if (s < 86_400) return `${Math.round(s / 3600)} jam lalu`;
  return `${Math.round(s / 86_400)} hari lalu`;
}

function CopyBox({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="relative">
      <pre className="max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 pr-24 font-mono text-xs leading-relaxed text-slate-800">{text}</pre>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(text).then(() => (setDone(true), setTimeout(() => setDone(false), 1500)))}
        className={`${smallBtn} absolute right-3 top-3 inline-flex items-center gap-1`}
        aria-label={`Salin ${label}`}
      >
        {done ? <Check size={12} /> : <Copy size={12} />} {done ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

const appsScript = (url: string, key: string) => `// Notifikasi WhatsApp Divisi K2 — kirim setiap jawaban Google Form ke web K2.
// Jangan bagikan kode ini: berisi kunci rahasia.
const URL_K2 = "${url}/api/notify/form";
const KUNCI = "${key}";

function kirimKeK2(e) {
  try {
    const r = UrlFetchApp.fetch(URL_K2, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ key: KUNCI, values: e.values }),
      muteHttpExceptions: true,
    });
    console.log(r.getResponseCode(), r.getContentText());
  } catch (err) {
    console.error(err);
  }
}

// Jalankan SEKALI untuk memasang pemicu "saat form dikirim".
function pasangPemicu() {
  const ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "kirimKeK2")
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("kirimKeK2").forSpreadsheet(ss).onFormSubmit().create();
}`;

async function fetchAdmin(): Promise<Data> {
  const r = await fetch("/api/notify/admin", { cache: "no-store" });
  const d = (await r.json()) as Data & { error?: string };
  if (!r.ok) throw new Error(d.error ?? "Gagal memuat");
  return { ...d, now: Date.now() }; // waktu pengambilan, untuk status "aktif" & "x menit lalu"
}

// Pengaturan notifikasi grup WhatsApp (khusus Admin Website).
export default function NotifEditor() {
  const [data, setData] = useState<Data | null>(null);
  const [draft, setDraft] = useState<NotifSettings | null>(null);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [msg, setMsg] = useState("");

  const load = () =>
    fetchAdmin()
      .then((d) => {
        setData(d);
        setDraft((cur) => cur ?? d.settings);
      })
      .catch((e: Error) => setErr(e.message));

  useEffect(() => {
    const run = () =>
      fetchAdmin()
        .then((d) => {
          setData(d);
          setDraft((cur) => cur ?? d.settings);
        })
        .catch((e: Error) => setErr(e.message));
    run();
    const id = setInterval(run, 20_000); // status bot & antrian diperbarui sendiri
    return () => clearInterval(id);
  }, []);

  if (err && !data) return <Panel title="Notifikasi WhatsApp"><p className="text-sm text-rose-600">{err}</p></Panel>;
  if (!data || !draft) return <Loading title="Notifikasi WhatsApp" />;

  const origin = window.location.origin; // data hanya ada di browser, jadi aman
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.settings);
  const { seen, length, log } = data.status;
  const online = !!seen && data.now - Date.parse(seen) < (data.settings.interval * 2 + 45) * 1000;
  const perHour = Math.round((2 * 3600) / draft.interval);

  async function save() {
    setSaving(true);
    setSaveStatus(null);
    try {
      const r = await adminFetch<{ settings: NotifSettings }>("/api/notify/admin", "PUT", draft);
      setData((d) => (d ? { ...d, settings: r.settings } : d));
      setDraft(r.settings);
      setSaveStatus({ type: "ok", text: "Tersimpan." });
    } catch (e) {
      setSaveStatus({ type: "err", text: (e as Error).message });
    }
    setSaving(false);
  }

  async function action(a: "test" | "rotate") {
    if (a === "rotate" && !confirm("Buat kunci baru? Kode Apps Script dan file .env bot harus diganti dengan yang baru, kalau tidak notifikasi berhenti.")) return;
    setMsg("");
    try {
      await adminFetch("/api/notify/admin", "POST", { action: a });
      setMsg(a === "test" ? "Pesan uji masuk antrian. Akan terkirim saat bot mengecek antrian berikutnya." : "Kunci baru dibuat. Perbarui kode Apps Script dan file .env bot.");
      load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  const sampleBase = { dilaporkan_oleh: "Ancis", waktu_laporan: fmtWib(new Date(data.now).toISOString()) };

  return (
    <div className="space-y-6">
      <Panel title="Notifikasi WhatsApp" desc="Laporan baru dikirim otomatis ke grup WhatsApp kelas lewat bot di laptop. Saat laptop mati, pesan menunggu di antrian dan dikirim begitu bot menyala lagi (yang menumpuk digabung jadi satu pesan rangkuman).">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className={`rounded-2xl border px-4 py-3 ${online ? "border-emerald-200 bg-emerald-50/80" : "border-slate-200 bg-white"}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bot</p>
            <p className={`flex items-center gap-1.5 font-bold ${online ? "text-emerald-700" : "text-slate-700"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-slate-400"}`} /> {online ? "Aktif" : "Tidak aktif"}
            </p>
            <p className="text-xs text-slate-500">{seen ? `Terakhir mengecek ${ago(seen, data.now)}` : "Belum pernah tersambung"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Menunggu dikirim</p>
            <p className="text-2xl font-extrabold text-slate-800">{length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="notif-interval">
              Bot mengecek tiap (detik)
            </label>
            <input
              id="notif-interval"
              type="number"
              min={15}
              max={300}
              value={draft.interval}
              onChange={(e) => setDraft({ ...draft, interval: Math.min(300, Math.max(15, Number(e.target.value) || 30)) })}
              className={`${input} mt-1 max-w-[7rem]`}
            />
            <p className="mt-1 text-xs text-slate-500">≈ {perHour} perintah Redis/jam saat bot menyala.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => action("test")} className="flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow">
            <Send size={14} /> Kirim pesan uji
          </button>
          {msg && <p className="text-sm font-medium text-slate-700">{msg}</p>}
        </div>
      </Panel>

      <Panel title="Template Pesan" desc="Tulis {nama_isian} untuk memasukkan data. Baris yang isiannya kosong otomatis dihilangkan. *teks* = tebal, _teks_ = miring di WhatsApp.">
        <div className="space-y-4">
          {NOTIF_DEFS.map((d) => (
            <div key={d.type} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={draft.enabled[d.type]}
                    onChange={(e) => setDraft({ ...draft, enabled: { ...draft.enabled, [d.type]: e.target.checked } })}
                    className="h-4 w-4 accent-sea-500"
                  />
                  {d.label}
                </label>
                {draft.templates[d.type] !== d.template && (
                  <button onClick={() => setDraft({ ...draft, templates: { ...draft.templates, [d.type]: d.template } })} className={`${smallBtn} inline-flex items-center gap-1`}>
                    <RotateCcw size={12} /> Kembalikan bawaan
                  </button>
                )}
              </div>
              <div className={`grid gap-3 lg:grid-cols-2 ${draft.enabled[d.type] ? "" : "opacity-50"}`}>
                <div className="space-y-2">
                  <textarea
                    value={draft.templates[d.type]}
                    onChange={(e) => setDraft({ ...draft, templates: { ...draft.templates, [d.type]: e.target.value } })}
                    rows={7}
                    className={`${input} font-mono text-xs leading-relaxed`}
                    aria-label={`Template ${d.label}`}
                  />
                  <div className="flex flex-wrap gap-1">
                    {d.fields.map((f) => (
                      <span key={f.key} title={f.label} className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                        {`{${f.key}}`}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Pratinjau</p>
                  {/* Gelembung chat ala WhatsApp; warna ditulis langsung supaya tetap terbaca di mode gelap. */}
                  <p className="whitespace-pre-wrap rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm" style={{ background: "#dcf8c6", color: "#0f172a" }}>
                    {render(draft.templates[d.type], { ...d.sample, ...sampleBase })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <SaveBar dirty={dirty} saving={saving} status={saveStatus} onSave={save} onReset={() => setDraft(data.settings)} />
      </Panel>

      <Panel title="Riwayat Kiriman" desc="30 kiriman terakhir dari bot.">
        {log.length ? (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white text-sm">
            {log.map((l, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-2.5">
                <span className={`text-xs font-semibold ${l.skipped ? "text-slate-400" : "text-emerald-600"}`}>{l.skipped ? "Dilewati" : "Terkirim"}</span>
                <span className="font-semibold text-slate-800">
                  {NOTIF_DEF[l.type]?.label ?? l.type}
                  {l.n > 1 && ` (${l.n})`}
                </span>
                <span className="text-xs text-slate-400">{fmtWib(l.at)}</span>
                {!l.skipped && <span className="w-full truncate text-xs text-slate-500">{l.preview.replace(/\n/g, " · ")}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Belum ada kiriman.</p>
        )}
      </Panel>

      <Panel title="Pemasangan" desc="Dua kunci rahasia di bawah menghubungkan Google Form dan bot ke web. Jangan dibagikan.">
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800">1. Google Form → web (Apps Script)</h4>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
            <li>Buka spreadsheet jawaban Google Form → menu <b>Ekstensi (Extensions) → Apps Script</b>.</li>
            <li>Hapus isi editor, tempel kode di bawah, lalu klik <b>Simpan</b>.</li>
            <li>
              Pilih fungsi <b>pasangPemicu</b> di bagian atas, klik <b>Jalankan</b>, lalu izinkan akses dengan akun Google kamu (cukup sekali).
            </li>
            <li>Kirim satu jawaban form untuk mencoba; pesannya muncul di antrian di atas.</li>
          </ol>
          <CopyBox label="kode Apps Script" text={appsScript(origin, data.keys.form)} />
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800">2. Bot WhatsApp di laptop</h4>
          <p className="text-sm text-slate-600">
            Ikuti panduan di folder{" "}
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="font-semibold text-sea-600 underline">
              bot/
            </a>{" "}
            pada repo GitHub. Isi file <code className="rounded bg-slate-100 px-1">.env</code> bot dengan:
          </p>
          <CopyBox label="isi .env bot" text={`WEB_URL=${origin}\nBOT_TOKEN=${data.keys.bot}\nGROUP_ID=`} />
          <p className="text-xs text-slate-500">GROUP_ID diisi setelah menjalankan <code className="rounded bg-slate-100 px-1">npm run grup</code> di laptop.</p>
        </div>
        <button onClick={() => action("rotate")} className={`${smallBtn} inline-flex w-fit items-center gap-1 text-rose-600`}>
          <KeyRound size={12} /> Buat kunci baru
        </button>
      </Panel>
    </div>
  );
}
