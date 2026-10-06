"use client";
import { useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { DIFFICULTY, URGENCY, daysLabel, urgencyOf, type TaskItem } from "@/lib/tasks";
import { DateSelect, Panel, SaveBar, TimeSelect, input, inputBase, newId, smallBtn, useContent } from "@/components/admin/ui";

const todayYmd = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
const EMPTY = { judul: "", matkul: "", deadline: "", jam: "", difficulty: 2 as TaskItem["difficulty"], catatan: "" };

// Tugas kelas: judul bebas (Quiz, Presentasi Expert, ...), deadline, dan tingkat kesulitan.
export default function TasksEditor() {
  const c = useContent("tasks");
  const [form, setForm] = useState(EMPTY);
  const d = c.draft;
  if (!d) return <Panel title="Tugas">Memuat...</Panel>;

  const today = todayYmd();
  const set = (id: string, patch: Partial<TaskItem>) => c.setDraft(d.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const add = () => {
    if (!form.judul.trim() || !form.deadline) return;
    c.setDraft([...d, { id: newId(), ...form, judul: form.judul.trim(), matkul: form.matkul.trim(), catatan: form.catatan.trim(), done: false }]);
    setForm({ ...EMPTY, matkul: form.matkul });
  };
  const sorted = [...d].sort((a, b) => Number(a.done) - Number(b.done) || a.deadline.localeCompare(b.deadline));

  return (
    <div className="space-y-6">
      <Panel title="Tambah tugas" desc="Tugas tampil di Kalender pada tanggal deadline. Sisa ≤ 3 hari = URGENT (merah), 4–10 hari = MEDIUM, lebih dari 10 hari = LOW.">
        <div className="grid items-center gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]">
          <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} placeholder="Judul (mis. Quiz, Presentasi Expert)" className={input} />
          <input value={form.matkul} onChange={(e) => setForm({ ...form, matkul: e.target.value })} placeholder="Mata kuliah (opsional)" className={input} />
          <DateSelect value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} label="Deadline" />
          <TimeSelect value={form.jam} onChange={(v) => setForm({ ...form, jam: v })} optional label="Jam deadline" />
          <div className="flex gap-1.5 lg:col-span-2" role="radiogroup" aria-label="Tingkat kesulitan">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm({ ...form, difficulty: n })}
                className={`flex-1 rounded-xl border px-2 py-2 text-xs font-bold transition ${form.difficulty === n ? DIFFICULTY[n].cls + " ring-2 ring-offset-1 ring-sea-500/40" : "border-slate-200 bg-white text-slate-500"}`}
              >
                {DIFFICULTY[n].label}
              </button>
            ))}
          </div>
          <input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Catatan (opsional)" className={input} />
          <button onClick={add} disabled={!form.judul.trim() || !form.deadline} className="flex items-center justify-center gap-1.5 rounded-xl bg-sea-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-40">
            <Plus size={15} /> Tambah
          </button>
        </div>
      </Panel>

      <Panel title={`Daftar tugas (${d.length})`} desc="Centang bulat untuk menandai tugas selesai. Tugas yang sudah lewat bisa dihapus.">
        {sorted.length === 0 && <p className="text-sm text-slate-400">Belum ada tugas.</p>}
        <div className="space-y-2">
          {sorted.map((t) => {
            const u = urgencyOf(t, today);
            return (
              <div key={t.id} className={`flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 ${t.done ? "opacity-60" : ""}`}>
                <button onClick={() => set(t.id, { done: !t.done })} className="text-slate-400 hover:text-emerald-600" title={t.done ? "Tandai belum selesai" : "Tandai selesai"}>
                  {t.done ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Circle size={20} />}
                </button>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black tracking-wider ${URGENCY[u.level].chip}`}>{URGENCY[u.level].label}</span>
                <input value={t.judul} onChange={(e) => set(t.id, { judul: e.target.value })} className={`${inputBase} min-w-[8rem] flex-1 py-1.5`} aria-label="Judul" />
                <input value={t.matkul} onChange={(e) => set(t.id, { matkul: e.target.value })} placeholder="Mata kuliah" className={`${inputBase} w-32 py-1.5`} aria-label="Mata kuliah" />
                <DateSelect value={t.deadline} onChange={(v) => v && set(t.id, { deadline: v })} label="Deadline" />
                <TimeSelect value={t.jam} onChange={(v) => set(t.id, { jam: v })} optional label="Jam" />
                <select value={t.difficulty} onChange={(e) => set(t.id, { difficulty: Number(e.target.value) as TaskItem["difficulty"] })} className={`${inputBase} w-28 py-1.5`} aria-label="Kesulitan">
                  {([1, 2, 3] as const).map((n) => (
                    <option key={n} value={n}>
                      {DIFFICULTY[n].label}
                    </option>
                  ))}
                </select>
                <span className="w-20 text-xs text-slate-500">{daysLabel(u.days)}</span>
                <button onClick={() => c.setDraft(d.filter((x) => x.id !== t.id))} className={`${smallBtn} text-rose-600`} aria-label="Hapus tugas">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </Panel>

      <SaveBar dirty={c.dirty} saving={c.saving} status={c.status} onSave={() => c.save()} onReset={c.reset} />
    </div>
  );
}
