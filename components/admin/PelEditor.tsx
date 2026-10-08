"use client";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Flame, Pencil, Plus, Trash2 } from "lucide-react";
import { buildPelanggaran, pelRows } from "@/lib/dashboard";
import type { PelEdit } from "@/lib/content";
import type { Table } from "@/lib/sheets";
import { DateSelect, Panel, SaveBar, StudentSelect, input, inputBase, newId, smallBtn, useContent, Loading } from "@/components/admin/ui";

const todayYmd = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

// Koreksi admin disimpan terpisah dari Google Sheets: sheet tidak berubah, tampilan web yang mengikuti koreksi ini.
export default function PelEditor() {
  const c = useContent("pelanggaran");
  const [table, setTable] = useState<Table | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ nama: "", tanggal: todayYmd(), kat: "", ket: "", poin: 1 });

  useEffect(() => {
    fetch("/api/sheet/pelanggaran", { cache: "no-store" })
      .then((r) => r.json())
      .then((t: Table) => setTable(t))
      .catch(() => setTable({ cols: [], rows: [], name: "B", date: "A" }));
  }, []);

  const d = c.draft;
  const rows = useMemo(() => (table && d ? pelRows(table, d).reverse() : []), [table, d]);
  const stats = useMemo(() => (table && d ? buildPelanggaran(table, d) : null), [table, d]);
  if (!d || !table || !stats) return <Loading title="Pelanggaran & Hall of Shame" />;

  const setEdit = (id: string, patch: PelEdit) => {
    const cur = { ...(d.edits[id] ?? {}), ...patch };
    const edits = { ...d.edits, [id]: cur };
    if (!cur.hidden) delete cur.hidden;
    if (!Object.keys(cur).length) delete edits[id];
    c.setDraft({ ...d, edits });
  };
  const removeAdded = (id: string) => {
    const edits = { ...d.edits };
    delete edits[id];
    c.setDraft({ ...d, added: d.added.filter((a) => a.id !== id), edits });
  };
  const addRow = () => {
    if (!form.nama || !form.kat.trim()) return;
    c.setDraft({ ...d, added: [...d.added, { id: `a:${newId()}`, ...form, kat: form.kat.trim(), ket: form.ket.trim(), poin: Math.max(0, Math.round(form.poin)) }] });
    setForm({ ...form, kat: "", ket: "", poin: 1 });
  };
  const toggleShame = (nama: string) =>
    c.setDraft({ ...d, hideFromShame: d.hideFromShame.includes(nama) ? d.hideFromShame.filter((x) => x !== nama) : [...d.hideFromShame, nama] });

  const ql = q.trim().toLowerCase();
  const shown = rows.filter((r) => !ql || [r.nama, r.kat, r.ket, r.tanggal].some((v) => v.toLowerCase().includes(ql)));
  const ranked = stats.students.filter((s) => s.jumlah > 0);

  return (
    <div className="space-y-6">
      <Panel title="Hall of Shame" desc="Tiga siswa dengan poin tertinggi tampil di Hall of Shame. Kecualikan siswa tertentu bila perlu.">
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.shame.map((s, i) => (
            <div key={s.nama} className="rounded-2xl border border-rose-200 bg-rose-50 p-3 shadow-sm">
              <p className="flex items-center gap-1 text-xs font-bold text-rose-600">
                <Flame size={12} /> #{i + 1}
              </p>
              <p className="font-bold text-slate-800">{s.nama}</p>
              <p className="text-xs text-slate-500">
                {s.jumlah} poin · {s.kasus} pelanggaran
              </p>
            </div>
          ))}
          {stats.shame.length === 0 && <p className="text-sm text-slate-400">Belum ada.</p>}
        </div>
        {ranked.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ranked.map((s) => {
              const hidden = d.hideFromShame.includes(s.nama);
              return (
                <button
                  key={s.nama}
                  onClick={() => toggleShame(s.nama)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${hidden ? "border-slate-300 bg-slate-100 text-slate-400 line-through" : "border-rose-200 bg-white text-slate-700"}`}
                  title={hidden ? "Dikecualikan dari Hall of Shame (klik untuk ikutkan lagi)" : "Klik untuk mengecualikan dari Hall of Shame"}
                >
                  {s.short} · {s.jumlah}
                </button>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Tambah pelanggaran" desc="Catatan tambahan dari admin, di luar form Google.">
        <div className="grid items-center gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_auto_minmax(0,1fr)_5.5rem]">
          <div>
            <StudentSelect value={form.nama} onChange={(v) => setForm({ ...form, nama: v })} empty="Pilih siswa" />
          </div>
          <DateSelect value={form.tanggal} onChange={(v) => v && setForm({ ...form, tanggal: v })} label="Tanggal" />
          <input value={form.kat} onChange={(e) => setForm({ ...form, kat: e.target.value })} placeholder="Jenis (mis. Terlambat)" list="pel-kat" className={input} />
          <input type="number" min={0} max={100} value={form.poin} onChange={(e) => setForm({ ...form, poin: Number(e.target.value) })} className={input} aria-label="Poin" />
          <input value={form.ket} onChange={(e) => setForm({ ...form, ket: e.target.value })} placeholder="Keterangan (opsional)" className={`${input} sm:col-span-2 lg:col-span-3`} />
          <button onClick={addRow} disabled={!form.nama || !form.kat.trim()} className="flex items-center justify-center gap-1.5 rounded-xl bg-sea-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-40">
            <Plus size={15} /> Tambah
          </button>
          <datalist id="pel-kat">
            {stats.categories.map((k) => (
              <option key={k.kategori} value={k.kategori} />
            ))}
          </datalist>
        </div>
      </Panel>

      <Panel title="Semua catatan pelanggaran" desc="Ubah jenis, keterangan, atau poin; sembunyikan catatan yang salah. Catatan dari form tidak bisa dihapus, hanya disembunyikan.">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, jenis, tanggal..." className={`${input} max-w-xs`} />
        <div className="custom-scrollbar max-h-[560px] overflow-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Tanggal</th>
                <th className="px-3 py-2.5">Nama</th>
                <th className="px-3 py-2.5">Jenis</th>
                <th className="px-3 py-2.5">Keterangan</th>
                <th className="px-3 py-2.5">Poin</th>
                <th className="px-3 py-2.5">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className={`border-t border-slate-100 align-top ${r.hidden ? "bg-slate-50 text-slate-400 line-through" : ""}`}>
                  <td className="whitespace-nowrap px-3 py-2">{r.tanggal}</td>
                  <td className="px-3 py-2">
                    {r.nama}
                    {r.source === "admin" && <span className="ml-1.5 rounded bg-sea-100 px-1.5 py-0.5 text-[10px] font-bold text-sea-600 no-underline">admin</span>}
                  </td>
                  {editing === r.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          defaultValue={r.kat}
                          onBlur={(e) => (r.source === "admin" ? c.setDraft({ ...d, added: d.added.map((a) => (a.id === r.id ? { ...a, kat: e.target.value.trim() || a.kat } : a)) }) : setEdit(r.id, { kat: e.target.value.trim() || undefined }))}
                          className={input}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          defaultValue={r.ket}
                          onBlur={(e) => (r.source === "admin" ? c.setDraft({ ...d, added: d.added.map((a) => (a.id === r.id ? { ...a, ket: e.target.value.trim() } : a)) }) : setEdit(r.id, { ket: e.target.value.trim() || undefined }))}
                          className={input}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2">{r.kat}</td>
                      <td className="px-3 py-2">{r.ket}</td>
                    </>
                  )}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={r.poin}
                      onChange={(e) => {
                        const poin = Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
                        if (r.source === "admin") c.setDraft({ ...d, added: d.added.map((a) => (a.id === r.id ? { ...a, poin } : a)) });
                        else setEdit(r.id, { poin: poin === 1 ? undefined : poin });
                      }}
                      className={`${inputBase} w-16 px-2 py-1`}
                      aria-label="Poin"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditing(editing === r.id ? null : r.id)} className={smallBtn} title="Ubah jenis / keterangan">
                        <Pencil size={13} />
                      </button>
                      {r.source === "admin" ? (
                        <button onClick={() => removeAdded(r.id)} className={`${smallBtn} text-rose-600`} title="Hapus catatan admin">
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <button onClick={() => setEdit(r.id, { hidden: !r.hidden })} className={smallBtn} title={r.hidden ? "Tampilkan lagi" : "Sembunyikan"}>
                          {r.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                    Tidak ada catatan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <SaveBar dirty={c.dirty} saving={c.saving} status={c.status} onSave={() => c.save()} onReset={c.reset} />
    </div>
  );
}
