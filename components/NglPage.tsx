"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, EyeOff, Flag, Lock, MessageCircleHeart, Search, Send, UserRound } from "lucide-react";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import { Loading } from "@/components/admin/ui";
import { STUDENTS } from "@/lib/students";

const MIN = 10;
const MAX = 500;
const HARI_BULAN = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

type Msg = { id: string; from: string | null; apresiasi: string; improvement: string; tambahan: string; reported: boolean };
type Group = { sid: string; openedAt: string; closedAt: string; messages: Msg[] };
type Data = { open: boolean; sid: string | null; done: number[]; perStudent: number; received: Group[]; waiting: boolean };
type Draft = { anon: boolean; apresiasi: string; improvement: string; tambahan: string };
const EMPTY: Draft = { anon: true, apresiasi: "", improvement: "", tambahan: "" };

// Draf tersimpan di perangkat ini saja (supaya tulisan tidak hilang kalau halaman tertutup sebelum dikirim).
const draftKey = (sid: string, to: number) => `k2-ngl:${sid}:${to}`;
function loadDraft(sid: string, to: number): Draft {
  try {
    const raw = localStorage.getItem(draftKey(sid, to));
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}
function saveDraft(sid: string, to: number, d: Draft | null) {
  try {
    if (d) localStorage.setItem(draftKey(sid, to), JSON.stringify(d));
    else localStorage.removeItem(draftKey(sid, to));
  } catch {}
}

async function fetchNgl(): Promise<Data> {
  const r = await fetch("/api/ngl", { cache: "no-store" });
  const d = (await r.json()) as Data & { error?: string };
  if (!r.ok) throw new Error(d.error ?? "Gagal memuat NGL");
  return d;
}

const CARD = "k2-card p-5 sm:p-6";

function Progress({ done, total }: { done: number; total: number }) {
  const p = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-slate-700">
        Sudah mengisi <b className="text-navy-900">{done}</b> dari {total} teman
      </p>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-all duration-500 ${p === 100 ? "bg-emerald-500" : "bg-sea-500"}`} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

function Field({ label, hint, value, onChange, required }: { label: string; hint: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  const n = value.trim().length;
  const short = required && n > 0 && n < MIN;
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-slate-800">
          {label} {required ? <span className="text-rose-500">*</span> : <span className="text-xs font-medium text-slate-500">(opsional)</span>}
        </span>
        <span className={`text-xs font-medium ${value.length > MAX ? "text-rose-600" : "text-slate-500"}`}>
          {value.length}/{MAX}
        </span>
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        rows={4}
        placeholder={hint}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sea-500 focus:ring-2 focus:ring-sea-500/30"
      />
      {short && <span className="text-xs font-medium text-rose-600">Minimal {MIN} karakter.</span>}
    </label>
  );
}

// NGL kelas: kirim apresiasi & area improvement untuk tiap teman, lalu baca pesan untukmu setelah sesi ditutup.
export default function NglPage() {
  const { user, ready } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [view, setView] = useState<"menu" | "isi" | "pesan">("menu");
  const [to, setTo] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [q, setQ] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const canUse = !!user && !user.tempPassword;
  useEffect(() => {
    if (!canUse) return;
    fetchNgl()
      .then(setData)
      .catch((e: Error) => setErr(e.message));
  }, [canUse]);

  const others = useMemo(() => STUDENTS.filter((s) => s.absen !== user?.absen), [user?.absen]);
  const list = others.filter((s) => !q.trim() || `${s.full} ${s.short} ${s.absen}`.toLowerCase().includes(q.trim().toLowerCase()));
  const totalMsgs = data?.received.reduce((n, g) => n + g.messages.length, 0) ?? 0;

  if (!ready) return <Loading />;
  if (!user)
    return (
      <div className="k2-card mx-auto max-w-md space-y-4 p-8 text-center">
        <MessageCircleHeart className="mx-auto text-pink-500" size={32} />
        <p className="font-semibold text-slate-700">Masuk dulu dengan akunmu untuk memakai NGL.</p>
        <Link href="/masuk" className="inline-block rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow">
          Masuk
        </Link>
      </div>
    );
  if (user.tempPassword)
    return (
      <div className="k2-card mx-auto max-w-md space-y-4 p-8 text-center">
        <Lock className="mx-auto text-slate-400" />
        <p className="font-semibold text-slate-700">Ganti password awalmu dulu sebelum memakai NGL, supaya tidak ada yang bisa mengisi atas namamu.</p>
        <Link href="/akun" className="inline-block rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow">
          Ganti password
        </Link>
      </div>
    );
  if (err && !data) return <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{err}</p>;
  if (!data) return <Loading />;

  const done = new Set(data.done);
  const target = to !== null ? STUDENTS.find((s) => s.absen === to) : undefined;
  const setD = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (data.sid && to !== null) saveDraft(data.sid, to, next);
  };
  const valid = draft.apresiasi.trim().length >= MIN && draft.improvement.trim().length >= MIN;

  function pick(absen: number) {
    if (!data?.sid) return;
    setTo(absen);
    setDraft(loadDraft(data.sid, absen));
    setNotice("");
  }

  async function send() {
    if (!data?.sid || to === null) return;
    setBusy(true);
    try {
      await adminFetch("/api/ngl", "POST", { to, ...draft });
      saveDraft(data.sid, to, null);
      setNotice(`Pesan untuk ${target?.short} terkirim.`);
      setTo(null);
      setDraft(EMPTY);
      setData(await fetchNgl());
    } catch (e) {
      setNotice((e as Error).message);
      setData(await fetchNgl().catch(() => data));
    }
    setConfirming(false);
    setBusy(false);
  }

  async function lapor(g: Group, m: Msg) {
    if (!confirm("Laporkan pesan ini ke admin? Admin akan meninjau dan bisa menghapusnya.")) return;
    try {
      await adminFetch("/api/ngl/report", "POST", { sid: g.sid, id: m.id });
      setData(await fetchNgl());
    } catch (e) {
      alert((e as Error).message);
    }
  }

  const back = (
    <button
      onClick={() => (to !== null ? setTo(null) : setView("menu"))}
      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
    >
      <ArrowLeft size={15} /> Kembali
    </button>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {view === "menu" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <button onClick={() => data.open && setView("isi")} disabled={!data.open} className={`${CARD} space-y-4 text-left transition enabled:hover:-translate-y-1 disabled:opacity-70`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-extrabold text-navy-900">Isi NGL</p>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${data.open ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {data.open ? "Sesi dibuka" : "Sesi ditutup"}
              </span>
            </div>
            {data.open ? <Progress done={data.done.length} total={data.perStudent} /> : <p className="text-sm text-slate-600">Sesi NGL belum dibuka admin. Kamu tetap bisa membaca pesan untukmu.</p>}
          </button>
          <button onClick={() => setView("pesan")} className={`${CARD} space-y-3 text-left transition hover:-translate-y-1`}>
            <p className="text-lg font-extrabold text-navy-900">Pesan untukku</p>
            <p className="text-sm text-slate-600">{totalMsgs ? `${totalMsgs} pesan dari teman-temanmu.` : "Belum ada pesan yang bisa dibaca."}</p>
            {data.waiting && <p className="text-xs font-medium text-amber-700">Pesan dari sesi yang sedang berjalan bisa dibaca setelah sesi ditutup admin.</p>}
          </button>
        </div>
      )}

      {notice && view !== "menu" && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p>}

      {view === "isi" && to === null && (
        <section className={`${CARD} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {back}
            <div className="min-w-[14rem] flex-1 sm:max-w-xs">
              <Progress done={data.done.length} total={data.perStudent} />
            </div>
          </div>
          {!data.open && <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">Sesi NGL sudah ditutup.</p>}
          <label className="relative block">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama teman..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-sea-500 focus:ring-2 focus:ring-sea-500/30"
            />
          </label>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => {
              const isDone = done.has(s.absen);
              return (
                <li key={s.absen}>
                  <button
                    onClick={() => pick(s.absen)}
                    disabled={isDone || !data.open}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${
                      isDone ? "border-emerald-200 bg-emerald-50/80" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sea-300 hover:shadow-md"
                    }`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${isDone ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {isDone ? <Check size={16} /> : s.absen}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-800">{s.full}</span>
                      <span className={`block text-xs ${isDone ? "font-semibold text-emerald-700" : "text-slate-500"}`}>{isDone ? "Sudah diisi" : s.short}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {view === "isi" && target && (
        <section className={`${CARD} space-y-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {back}
            <p className="text-sm text-slate-600">
              Untuk <b className="text-navy-900">{target.full}</b> ({target.short})
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-bold text-slate-800">Kirim sebagai</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { anon: true, icon: EyeOff, title: "Anonim", desc: "Namamu tidak ditampilkan ke penerima" },
                { anon: false, icon: UserRound, title: `Tampilkan namaku (${user.panggilan})`, desc: "Penerima tahu pesan ini darimu" },
              ].map((o) => (
                <label
                  key={String(o.anon)}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${draft.anon === o.anon ? "border-sea-500 bg-sea-50/80 ring-2 ring-sea-500/20" : "border-slate-200 bg-white"}`}
                >
                  <input type="radio" name="anon" checked={draft.anon === o.anon} onChange={() => setD({ anon: o.anon })} className="mt-1 accent-sea-500" />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                      <o.icon size={15} /> {o.title}
                    </span>
                    <span className="text-xs text-slate-500">{o.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field label={`Apresiasi untuk ${target.short}`} hint="Hal baik yang kamu hargai darinya..." value={draft.apresiasi} onChange={(v) => setD({ apresiasi: v })} required />
          <Field label={`Area improvement untuk ${target.short}`} hint="Hal yang bisa ia tingkatkan, sampaikan dengan baik..." value={draft.improvement} onChange={(v) => setD({ improvement: v })} required />
          <Field label="Pesan tambahan" hint="Boleh dikosongkan" value={draft.tambahan} onChange={(v) => setD({ tambahan: v })} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Draf tersimpan otomatis di perangkat ini sampai dikirim.</p>
            <button
              onClick={() => setConfirming(true)}
              disabled={!valid || busy}
              className="flex items-center gap-1.5 rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-40"
            >
              <Send size={15} /> Kirim
            </button>
          </div>
          {notice && <p className="text-sm font-medium text-rose-600">{notice}</p>}
        </section>
      )}

      {view === "pesan" && (
        <section className="space-y-5">
          {back}
          {data.waiting && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              Sesi NGL sedang berjalan. Pesan dari sesi ini bisa dibaca setelah sesi ditutup admin.
            </p>
          )}
          {!totalMsgs && <p className={`${CARD} text-sm text-slate-600`}>Belum ada pesan yang bisa dibaca.</p>}
          {data.received
            .filter((g) => g.messages.length)
            .map((g) => (
              <div key={g.sid} className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Sesi NGL · {HARI_BULAN(g.openedAt)} – {HARI_BULAN(g.closedAt)} · {g.messages.length} pesan
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {g.messages.map((m) => (
                    <article key={m.id} className={`${CARD} space-y-3`}>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                        {m.from ? <UserRound size={15} className="text-sea-600" /> : <EyeOff size={15} className="text-slate-400" />}
                        {m.from ? `Dari ${m.from}` : "Anonim"}
                      </p>
                      <div className="space-y-1 rounded-2xl bg-emerald-50/80 px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Apresiasi</p>
                        <p className="whitespace-pre-wrap text-sm text-slate-800">{m.apresiasi}</p>
                      </div>
                      <div className="space-y-1 rounded-2xl bg-amber-50 px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Area improvement</p>
                        <p className="whitespace-pre-wrap text-sm text-slate-800">{m.improvement}</p>
                      </div>
                      {m.tambahan && (
                        <div className="space-y-1 rounded-2xl bg-slate-100 px-4 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Pesan tambahan</p>
                          <p className="whitespace-pre-wrap text-sm text-slate-800">{m.tambahan}</p>
                        </div>
                      )}
                      <div className="flex justify-end">
                        {m.reported ? (
                          <span className="text-xs font-semibold text-slate-500">Sudah dilaporkan ke admin</span>
                        ) : (
                          <button onClick={() => lapor(g, m)} className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline">
                            <Flag size={12} /> Laporkan
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
        </section>
      )}

      {confirming && target && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[90] grid place-items-center bg-[rgba(11,30,61,0.55)] p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-lg font-extrabold text-navy-900">Kirim pesan untuk {target.short}?</p>
            <p className="text-sm text-slate-600">
              Dikirim sebagai <b>{draft.anon ? "Anonim" : user.panggilan}</b>. Pesan <b>tidak bisa diubah</b> setelah dikirim.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirming(false)} disabled={busy} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Periksa lagi
              </button>
              <button onClick={send} disabled={busy} className="flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow">
                <Send size={14} /> {busy ? "Mengirim..." : "Ya, kirim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
