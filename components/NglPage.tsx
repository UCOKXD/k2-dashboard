"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { compressImage } from "@/components/imageTools";
import { ArrowLeft, Check, EyeOff, Flag, ImagePlus, Lock, MessageCircleHeart, Search, Send, Trash2, UserRound } from "lucide-react";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import { Loading } from "@/components/admin/ui";
import { STUDENTS } from "@/lib/students";
import { avatarSrc, useAvatars } from "@/components/useAvatars";

const MIN = 10;
const MAX = 500;
const HARI_BULAN = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

type Msg = { id: string; from: string | null; apresiasi: string; improvement: string; tambahan: string; foto?: boolean; reported: boolean };
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
      <p className="text-sm font-semibold text-ink-2">
        Sudah mengisi <b className="text-ink">{done}</b> dari {total} teman
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
        <span className="text-sm font-bold text-ink">
          {label} {required ? <span className="text-rose-500">*</span> : <span className="text-xs font-medium text-ink-3">(opsional)</span>}
        </span>
        <span className={`text-xs font-medium ${value.length > MAX ? "text-bad" : "text-ink-3"}`}>
          {value.length}/{MAX}
        </span>
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        rows={4}
        placeholder={hint}
        className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-sea-500 focus:ring-2 focus:ring-sea-500/30"
      />
      {short && <span className="text-xs font-medium text-bad">Minimal {MIN} karakter.</span>}
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

  const [foto, setFoto] = useState<string | null>(null); // lampiran (data URL WebP), tidak disimpan di draf
  const [fotoBusy, setFotoBusy] = useState(false);
  const fotoInput = useRef<HTMLInputElement>(null);
  const avatars = useAvatars();
  const others = useMemo(() => STUDENTS.filter((s) => s.absen !== user?.absen), [user?.absen]);
  const list = others.filter((s) => !q.trim() || `${s.full} ${s.short} ${s.absen}`.toLowerCase().includes(q.trim().toLowerCase()));
  const totalMsgs = data?.received.reduce((n, g) => n + g.messages.length, 0) ?? 0;

  if (!ready) return <Loading />;
  if (!user)
    return (
      <div className="k2-card mx-auto max-w-md space-y-4 p-8 text-center">
        <MessageCircleHeart className="mx-auto text-pink-500" size={32} />
        <p className="font-semibold text-ink-2">Masuk dulu dengan akunmu untuk memakai NGL.</p>
        <Link href="/masuk" className="inline-block rounded-k2-md bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow">
          Masuk
        </Link>
      </div>
    );
  if (user.tempPassword)
    return (
      <div className="k2-card mx-auto max-w-md space-y-4 p-8 text-center">
        <Lock className="mx-auto text-ink-3" />
        <p className="font-semibold text-ink-2">Ganti password awalmu dulu sebelum memakai NGL, supaya tidak ada yang bisa mengisi atas namamu.</p>
        <Link href="/akun" className="inline-block rounded-k2-md bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow">
          Ganti password
        </Link>
      </div>
    );
  if (err && !data) return <p className="rounded-2xl bg-bad-soft px-4 py-3 text-sm font-medium text-bad">{err}</p>;
  if (!data) return <Loading />;

  const done = new Set(data.done);
  const target = to !== null ? STUDENTS.find((s) => s.absen === to) : undefined;
  const setD = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (data.sid && to !== null) saveDraft(data.sid, to, next);
  };
  const valid = draft.apresiasi.trim().length >= MIN && draft.improvement.trim().length >= MIN && !fotoBusy;

  function pick(absen: number) {
    if (!data?.sid) return;
    setTo(absen);
    setDraft(loadDraft(data.sid, absen));
    setFoto(null);
    setNotice("");
  }

  async function send() {
    if (!data?.sid || to === null) return;
    setBusy(true);
    try {
      await adminFetch("/api/ngl", "POST", { to, ...draft, ...(foto ? { foto } : {}) });
      setFoto(null);
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
      className="flex items-center gap-1.5 rounded-k2-md border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-ink-2 shadow-sm"
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
              <p className="text-lg font-extrabold text-ink">Isi NGL</p>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${data.open ? "bg-ok-soft text-ok" : "bg-surface-2 text-ink-2"}`}>
                {data.open ? "Sesi dibuka" : "Sesi ditutup"}
              </span>
            </div>
            {data.open ? <Progress done={data.done.length} total={data.perStudent} /> : <p className="text-sm text-ink-2">Sesi NGL belum dibuka admin. Kamu tetap bisa membaca pesan untukmu.</p>}
          </button>
          <button onClick={() => setView("pesan")} className={`${CARD} space-y-3 text-left transition hover:-translate-y-1`}>
            <p className="text-lg font-extrabold text-ink">Pesan untukku</p>
            <p className="text-sm text-ink-2">{totalMsgs ? `${totalMsgs} pesan dari teman-temanmu.` : "Belum ada pesan yang bisa dibaca."}</p>
            {data.waiting && <p className="text-xs font-medium text-warn">Pesan dari sesi yang sedang berjalan bisa dibaca setelah sesi ditutup admin.</p>}
          </button>
        </div>
      )}

      {notice && view !== "menu" && <p className="rounded-2xl bg-ok-soft px-4 py-3 text-sm font-medium text-ok">{notice}</p>}

      {view === "isi" && to === null && (
        <section className={`${CARD} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {back}
            <div className="min-w-[14rem] flex-1 sm:max-w-xs">
              <Progress done={data.done.length} total={data.perStudent} />
            </div>
          </div>
          {!data.open && <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm font-medium text-ink-2">Sesi NGL sudah ditutup.</p>}
          <label className="relative block">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama teman..."
              className="w-full rounded-2xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-sea-500 focus:ring-2 focus:ring-sea-500/30"
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
                      isDone ? "border-ok/30 bg-emerald-50/80" : "border-line bg-surface hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
                    }`}
                  >
                    <span className="relative shrink-0">
                      {avatarSrc(avatars, s.absen) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img width={320} height={320} src={avatarSrc(avatars, s.absen)} alt="" loading="lazy" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <span className={`grid h-9 w-9 place-items-center rounded-full font-mono text-xs font-bold ${isDone ? "bg-emerald-500 text-white" : "bg-surface-2 text-ink-2"}`}>
                          {isDone ? <Check size={16} /> : s.absen}
                        </span>
                      )}
                      {isDone && avatarSrc(avatars, s.absen) && (
                        <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{s.full}</span>
                      <span className={`block text-xs ${isDone ? "font-semibold text-ok" : "text-ink-3"}`}>{isDone ? "Sudah diisi" : s.short}</span>
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
            <p className="text-sm text-ink-2">
              Untuk <b className="text-ink">{target.full}</b> ({target.short})
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-bold text-ink">Kirim sebagai</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { anon: true, icon: EyeOff, title: "Anonim", desc: "Namamu tidak ditampilkan ke penerima" },
                { anon: false, icon: UserRound, title: `Tampilkan namaku (${user.panggilan})`, desc: "Penerima tahu pesan ini darimu" },
              ].map((o) => (
                <label
                  key={String(o.anon)}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${draft.anon === o.anon ? "border-sea-500 bg-sea-50/80 ring-2 ring-sea-500/20" : "border-line bg-surface"}`}
                >
                  <input type="radio" name="anon" checked={draft.anon === o.anon} onChange={() => setD({ anon: o.anon })} className="mt-1 accent-sea-500" />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                      <o.icon size={15} /> {o.title}
                    </span>
                    <span className="text-xs text-ink-3">{o.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field label={`Apresiasi untuk ${target.short}`} hint="Hal baik yang kamu hargai darinya..." value={draft.apresiasi} onChange={(v) => setD({ apresiasi: v })} required />
          <Field label={`Area improvement untuk ${target.short}`} hint="Hal yang bisa ia tingkatkan, sampaikan dengan baik..." value={draft.improvement} onChange={(v) => setD({ improvement: v })} required />
          <Field label="Pesan tambahan" hint="Boleh dikosongkan" value={draft.tambahan} onChange={(v) => setD({ tambahan: v })} />

          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink-2">
              Foto <span className="font-normal text-ink-3">(opsional, maks. 1)</span>
            </p>
            {foto ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img width={800} height={600} src={foto} alt="Foto yang akan dikirim" className="max-h-56 rounded-2xl object-contain h-auto w-auto" />
                <button type="button" onClick={() => setFoto(null)} aria-label="Hapus foto" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-rose-600">
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={fotoBusy}
                onClick={() => fotoInput.current?.click()}
                className="inline-flex min-h-11 items-center gap-2 rounded-k2-md border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-ink-3 disabled:opacity-50"
              >
                <ImagePlus size={15} /> {fotoBusy ? "Mengecilkan foto…" : "Tambah foto"}
              </button>
            )}
            <input
              ref={fotoInput}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setFotoBusy(true);
                try {
                  setFoto(await compressImage(f));
                } catch (err) {
                  setNotice((err as Error).message);
                }
                setFotoBusy(false);
              }}
            />
            <p className="text-xs text-ink-3">Foto dikecilkan otomatis (±200 KB) dan ikut anonim kalau kamu memilih anonim. Foto tidak ikut disimpan di draf.</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-3">Draf tersimpan otomatis di perangkat ini sampai dikirim.</p>
            <button
              onClick={() => setConfirming(true)}
              disabled={!valid || busy}
              className="flex items-center gap-1.5 rounded-k2-md bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-40"
            >
              <Send size={15} /> Kirim
            </button>
          </div>
          {notice && <p className="text-sm font-medium text-bad">{notice}</p>}
        </section>
      )}

      {view === "pesan" && (
        <section className="space-y-5">
          {back}
          {data.waiting && (
            <p className="rounded-2xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm font-medium text-warn">
              Sesi NGL sedang berjalan. Pesan dari sesi ini bisa dibaca setelah sesi ditutup admin.
            </p>
          )}
          {!totalMsgs && <p className={`${CARD} text-sm text-ink-2`}>Belum ada pesan yang bisa dibaca.</p>}
          {data.received
            .filter((g) => g.messages.length)
            .map((g) => (
              <div key={g.sid} className="space-y-3">
                <p className="text-xs font-bold text-ink-3">
                  Sesi NGL · {HARI_BULAN(g.openedAt)} – {HARI_BULAN(g.closedAt)} · {g.messages.length} pesan
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {g.messages.map((m) => (
                    <article key={m.id} className={`${CARD} space-y-3`}>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                        {m.from ? <UserRound size={15} className="text-accent-ink" /> : <EyeOff size={15} className="text-ink-3" />}
                        {m.from ? `Dari ${m.from}` : "Anonim"}
                      </p>
                      <div className="space-y-1 rounded-2xl bg-emerald-50/80 px-4 py-3">
                        <p className="text-xs font-bold text-ok">Apresiasi</p>
                        <p className="whitespace-pre-wrap text-sm text-ink">{m.apresiasi}</p>
                      </div>
                      <div className="space-y-1 rounded-2xl bg-warn-soft px-4 py-3">
                        <p className="text-xs font-bold text-warn">Area improvement</p>
                        <p className="whitespace-pre-wrap text-sm text-ink">{m.improvement}</p>
                      </div>
                      {m.foto && (
                        <a href={`/api/ngl/foto?sid=${g.sid}&id=${m.id}`} target="_blank" rel="noopener noreferrer" className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img width={800} height={600} src={`/api/ngl/foto?sid=${g.sid}&id=${m.id}`} alt="Foto dari pengirim" loading="lazy" className="max-h-72 w-full rounded-2xl bg-surface-2 object-contain h-auto" />
                        </a>
                      )}
                      {m.tambahan && (
                        <div className="space-y-1 rounded-2xl bg-surface-2 px-4 py-3">
                          <p className="text-xs font-bold text-ink-2">Pesan tambahan</p>
                          <p className="whitespace-pre-wrap text-sm text-ink">{m.tambahan}</p>
                        </div>
                      )}
                      <div className="flex justify-end">
                        {m.reported ? (
                          <span className="text-xs font-semibold text-ink-3">Sudah dilaporkan ke admin</span>
                        ) : (
                          <button onClick={() => lapor(g, m)} className="flex items-center gap-1 text-xs font-semibold text-bad hover:underline">
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
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[90] grid place-items-center bg-[rgba(11,30,61,0.55)] p-4">
          <div className="w-full max-w-sm space-y-4 rounded-3xl bg-surface p-6 shadow-2xl">
            <p className="text-lg font-extrabold text-ink">Kirim pesan untuk {target.short}?</p>
            <p className="text-sm text-ink-2">
              Dikirim sebagai <b>{draft.anon ? "Anonim" : user.panggilan}</b>. Pesan <b>tidak bisa diubah</b> setelah dikirim.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirming(false)} disabled={busy} className="rounded-k2-md border border-line px-4 py-2 text-sm font-semibold text-ink-2">
                Periksa lagi
              </button>
              <button onClick={send} disabled={busy} className="flex items-center gap-1.5 rounded-k2-md bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow">
                <Send size={14} /> {busy ? "Mengirim..." : "Ya, kirim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
