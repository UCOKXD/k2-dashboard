"use client";
import { Plus, Trash2 } from "lucide-react";
import { HARI, type ScheduleItem } from "@/lib/content";
import { Panel, SaveBar, TimeSelect, input, newId, smallBtn, useContent } from "@/components/admin/ui";

// Jadwal kuliah mingguan. Tampil di halaman Jadwal dan kartu "Kelas berikutnya" di halaman utama.
export default function ScheduleEditor() {
  const c = useContent("schedule");
  const d = c.draft;
  if (!d) return <Panel title="Jadwal Kuliah">Memuat...</Panel>;

  const set = (id: string, patch: Partial<ScheduleItem>) => c.setDraft(d.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const sorted = [...d].sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
  const incomplete = d.some((s) => !s.matkul.trim() || !s.start || !s.end);

  return (
    <Panel title="Jadwal Kuliah" desc="Satu baris = satu sesi kuliah. Baris tanpa nama mata kuliah atau jam tidak akan disimpan.">
      <div className="space-y-2">
        {sorted.map((s) => (
          <div key={s.id} className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 sm:grid-cols-[8rem_auto_auto_1fr_7rem_1fr_auto] items-center">
            <select value={s.day} onChange={(e) => set(s.id, { day: Number(e.target.value) })} className={input} aria-label="Hari">
              {[1, 2, 3, 4, 5, 6].map((h) => (
                <option key={h} value={h}>
                  {HARI[h]}
                </option>
              ))}
            </select>
            <TimeSelect value={s.start} onChange={(v) => set(s.id, { start: v })} label="Mulai" />
            <TimeSelect value={s.end} onChange={(v) => set(s.id, { end: v })} label="Selesai" />
            <input value={s.matkul} onChange={(e) => set(s.id, { matkul: e.target.value })} placeholder="Mata kuliah" className={`${input} col-span-2 sm:col-span-1`} />
            <input value={s.ruang} onChange={(e) => set(s.id, { ruang: e.target.value })} placeholder="Ruang" className={input} />
            <input value={s.dosen} onChange={(e) => set(s.id, { dosen: e.target.value })} placeholder="Dosen" className={input} />
            <button onClick={() => c.setDraft(d.filter((x) => x.id !== s.id))} className={`${smallBtn} text-rose-600`} aria-label="Hapus sesi">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {d.length === 0 && <p className="text-sm text-slate-400">Belum ada jadwal.</p>}
      </div>
      <button
        onClick={() => {
          const last = sorted[sorted.length - 1];
          c.setDraft([...d, { id: newId(), day: last?.day ?? 1, start: last?.end ?? "08:00", end: "", matkul: "", ruang: last?.ruang ?? "", dosen: "" }]);
        }}
        className={`${smallBtn} flex items-center gap-1`}
      >
        <Plus size={13} /> Tambah sesi
      </button>
      {incomplete && <p className="text-xs text-amber-700">Ada baris yang belum lengkap (mata kuliah / jam).</p>}
      <SaveBar dirty={c.dirty} saving={c.saving} status={c.status} onSave={() => c.save()} onReset={c.reset} />
    </Panel>
  );
}
