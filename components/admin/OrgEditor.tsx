"use client";
import { Plus, Trash2 } from "lucide-react";
import type { OrgData } from "@/lib/content";
import { Panel, SaveBar, StudentSelect, input, smallBtn, useContent } from "@/components/admin/ui";

const ROLES: [keyof Omit<OrgData, "dpp" | "anggota">, string][] = [
  ["komti", "Komti (Ketua Kelas)"],
  ["wakomti", "Wakomti (Wakil Ketua)"],
  ["bendahara", "Bendahara"],
  ["sekretaris", "Sekretaris"],
  ["koordinator", "Koordinator K2"],
];

export default function OrgEditor() {
  const c = useContent("org");
  const d = c.draft;
  if (!d) return <Panel title="Struktur Organisasi">Memuat...</Panel>;
  const set = (patch: Partial<OrgData>) => c.setDraft({ ...d, ...patch });

  return (
    <Panel title="Struktur Organisasi" desc="Atur nama pengurus yang tampil di halaman utama. Panggilan diambil otomatis dari data siswa.">
      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-700">DPP (Dewan Pembina)</span>
        <input value={d.dpp} onChange={(e) => set({ dpp: e.target.value })} placeholder="Kosongkan agar hanya tertulis DPP" className={input} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map(([k, label]) => (
          <label key={k} className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            <StudentSelect value={d[k]} onChange={(v) => set({ [k]: v } as Partial<OrgData>)} />
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Anggota K2</p>
        {d.anggota.map((a, i) => (
          <div key={i} className="flex gap-2">
            <StudentSelect value={a} onChange={(v) => set({ anggota: d.anggota.map((x, j) => (j === i ? v : x)) })} />
            <button onClick={() => set({ anggota: d.anggota.filter((_, j) => j !== i) })} className={smallBtn} aria-label="Hapus anggota">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {d.anggota.length < 6 && (
          <button onClick={() => set({ anggota: [...d.anggota, ""] })} className={`${smallBtn} flex items-center gap-1`}>
            <Plus size={13} /> Tambah anggota
          </button>
        )}
      </div>
      <SaveBar dirty={c.dirty} saving={c.saving} status={c.status} onSave={() => c.save()} onReset={c.reset} />
    </Panel>
  );
}
