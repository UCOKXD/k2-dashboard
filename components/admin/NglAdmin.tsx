"use client";
import { useEffect, useState } from "react";
import { EyeOff, Flag, Lock, LockOpen, Trash2, UserRound } from "lucide-react";
import { adminFetch } from "@/components/AuthProvider";
import { Loading, Panel, input, smallBtn } from "@/components/admin/ui";
import { STUDENTS } from "@/lib/students";

type Session = { id: string; openedAt: string; openedBy: string; closedAt?: string; closedBy?: string };
type Person = { absen: number; nama: string; panggilan: string };
type Message = { id: string; from: number; to: number; anon: boolean; apresiasi: string; improvement: string; tambahan: string; at: string; sender: Person };
type Report = { sid: string; id: string; to: number; at: string; message: Message; sender: Person; recipient: Person };
type Data = {
  state: { open: boolean; current: Session | null };
  sessions: Session[];
  progress: { sid: string; count: number; total: number; perStudent: number; students: { absen: number; done: number }[] } | null;
  reports: Report[];
};

const tgl = (iso?: string) => (iso ? new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "");
const nama = (absen: number) => STUDENTS.find((s) => s.absen === absen);

async function fetchAdmin(): Promise<Data> {
  const r = await fetch("/api/ngl/admin", { cache: "no-store" });
  const d = (await r.json()) as Data & { error?: string };
  if (!r.ok) throw new Error(d.error ?? "Gagal memuat");
  return d;
}

function MessageCard({ m, onDelete }: { m: Message; onDelete?: () => void }) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-semibold text-slate-800">
          {m.anon ? <EyeOff size={14} className="text-slate-400" /> : <UserRound size={14} className="text-sea-600" />}
          Dari {m.sender.nama} ({m.sender.panggilan}) → {nama(m.to)?.short}
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.anon ? "bg-slate-100 text-slate-600" : "bg-sea-50 text-sea-600"}`}>{m.anon ? "dikirim anonim" : "pakai nama"}</span>
        </p>
        {onDelete && (
          <button onClick={onDelete} className={`${smallBtn} inline-flex items-center gap-1 text-rose-600`}>
            <Trash2 size={12} /> Hapus pesan
          </button>
        )}
      </div>
      <p>
        <b className="text-emerald-700">Apresiasi:</b> <span className="whitespace-pre-wrap text-slate-700">{m.apresiasi}</span>
      </p>
      <p>
        <b className="text-amber-700">Area improvement:</b> <span className="whitespace-pre-wrap text-slate-700">{m.improvement}</span>
      </p>
      {m.tambahan && (
        <p>
          <b className="text-slate-600">Pesan tambahan:</b> <span className="whitespace-pre-wrap text-slate-700">{m.tambahan}</span>
        </p>
      )}
    </div>
  );
}

// Admin NGL (izin "NGL"): buka/tutup sesi, progres pengisian, laporan, dan isi pesan beserta pengirim asli.
export default function NglAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [sid, setSid] = useState("");
  const [to, setTo] = useState(0);
  const [messages, setMessages] = useState<Message[] | null>(null);

  useEffect(() => {
    fetchAdmin()
      .then(setData)
      .catch((e: Error) => setErr(e.message));
  }, []);
  const reload = () => fetchAdmin().then(setData).catch((e: Error) => setErr(e.message));

  if (err && !data) return <Panel title="NGL"><p className="text-sm text-rose-600">{err}</p></Panel>;
  if (!data) return <Loading title="NGL" />;

  const { state, progress, reports } = data;
  const selSid = sid || progress?.sid || "";

  async function act(body: Record<string, unknown>, ask?: string) {
    if (ask && !confirm(ask)) return false;
    setMsg("");
    try {
      await adminFetch("/api/ngl/admin", "POST", body);
      await reload();
      return true;
    } catch (e) {
      setMsg((e as Error).message);
      return false;
    }
  }

  async function show(s: string, absen: number) {
    setSid(s);
    setTo(absen);
    setMessages(null);
    if (!s || !absen) return;
    const r = await fetch(`/api/ngl/admin?sid=${encodeURIComponent(s)}&to=${absen}`, { cache: "no-store" });
    const d = (await r.json()) as { messages?: Message[] };
    setMessages(d.messages ?? []);
  }

  const p = progress ? Math.floor((progress.count * 100) / progress.total) : 0;
  const rows = progress ? [...progress.students].sort((a, b) => a.done - b.done || a.absen - b.absen) : [];
  const lengkap = rows.filter((r) => r.done >= (progress?.perStudent ?? 0)).length;

  return (
    <div className="space-y-6">
      <Panel title="Sesi NGL" desc="Buka sesi agar siswa bisa mengisi. Sesi baru membuat semua centang mulai dari nol lagi. Pesan baru bisa dibaca penerima setelah sesi ditutup, dan tersimpan 3 bulan setelahnya.">
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${state.open ? "border-emerald-200 bg-emerald-50/80" : "border-slate-200 bg-white"}`}>
          <p className="text-sm font-semibold text-slate-800">
            {state.open ? (
              <>
                <span className="text-emerald-700">● Sesi dibuka</span> sejak {tgl(state.current?.openedAt)} oleh {state.current?.openedBy}
              </>
            ) : state.current ? (
              <>Sesi terakhir ditutup {tgl(state.current.closedAt)} oleh {state.current.closedBy}</>
            ) : (
              <>Belum pernah ada sesi NGL.</>
            )}
          </p>
          {state.open ? (
            <button
              onClick={() => act({ action: "close" }, "Tutup sesi NGL? Siswa tidak bisa mengisi lagi, dan pesan bisa langsung dibaca penerima.")}
              className="flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow"
            >
              <Lock size={14} /> Tutup sesi
            </button>
          ) : (
            <button
              onClick={() => act({ action: "open" }, "Buka sesi NGL baru? Semua siswa bisa mengisi lagi untuk semua teman (centang mulai dari nol). Pesan sesi sebelumnya tetap tersimpan.")}
              className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow"
            >
              <LockOpen size={14} /> Buka sesi NGL baru
            </button>
          )}
        </div>
        {msg && <p className="text-sm font-medium text-rose-600">{msg}</p>}
      </Panel>

      {progress && (
        <Panel title={`Progres pengisian ${state.open ? "(sesi berjalan)" : "(sesi terakhir)"}`} desc="Jumlah teman yang sudah diisi tiap siswa. Isi pesannya tidak ditampilkan di sini.">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-700">
              {progress.count} dari {progress.total} pesan ({p}%) · {lengkap} dari {rows.length} siswa sudah lengkap
            </p>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-sea-500" style={{ width: `${p}%` }} />
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => {
              const s = nama(r.absen);
              const full = r.done >= progress.perStudent;
              return (
                <li key={r.absen} className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm">
                  <span className="min-w-0 truncate font-semibold text-slate-800">
                    {r.absen}. {s?.short}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      full ? "bg-emerald-50 text-emerald-700" : r.done === 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {full ? "Lengkap" : r.done === 0 ? "Belum mengisi" : `${r.done}/${progress.perStudent}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <Panel title={`Laporan pesan (${reports.length})`} desc="Pesan yang dilaporkan penerimanya. Pengirim asli terlihat di sini walau pesannya dikirim anonim.">
        {reports.length ? (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                  <Flag size={12} /> Dilaporkan {r.recipient.panggilan} · {tgl(r.at)}
                </p>
                <MessageCard m={{ ...r.message, sender: r.sender }} onDelete={() => act({ action: "delete", sid: r.sid, to: r.to, id: r.id }, "Hapus pesan ini? Penerima tidak akan melihatnya lagi.")} />
                <button onClick={() => act({ action: "dismiss", id: r.id })} className={smallBtn}>
                  Abaikan laporan
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Tidak ada laporan.</p>
        )}
      </Panel>

      <Panel title="Lihat pesan" desc="Semua pesan untuk satu siswa beserta pengirim aslinya (khusus admin NGL).">
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={selSid} onChange={(e) => show(e.target.value, to)} className={input} aria-label="Pilih sesi">
            <option value="">Pilih sesi</option>
            {data.sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {tgl(s.openedAt)} – {s.closedAt ? tgl(s.closedAt) : "berjalan"}
              </option>
            ))}
          </select>
          <select value={to || ""} onChange={(e) => show(selSid, Number(e.target.value))} className={input} aria-label="Pilih siswa">
            <option value="">Pilih siswa (penerima)</option>
            {STUDENTS.map((s) => (
              <option key={s.absen} value={s.absen}>
                {s.absen}. {s.full} ({s.short})
              </option>
            ))}
          </select>
        </div>
        {messages && (
          <div className="space-y-3">
            {messages.length ? (
              messages.map((m) => (
                <MessageCard key={m.id} m={m} onDelete={() => act({ action: "delete", sid: selSid, to, id: m.id }, "Hapus pesan ini? Penerima tidak akan melihatnya lagi.").then((ok) => {
                    if (ok) show(selSid, to);
                  })} />
              ))
            ) : (
              <p className="text-sm text-slate-500">Belum ada pesan untuk siswa ini di sesi tersebut.</p>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
