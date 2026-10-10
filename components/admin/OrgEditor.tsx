"use client";
import { Lock, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import type { OrgData } from "@/lib/content";
import { Panel, SaveBar, StudentSelect, input, smallBtn, useContent, Loading } from "@/components/admin/ui";

const ROLES: [keyof Omit<OrgData, "dpp" | "anggota">, string][] = [
  ["komti", "Komti (Ketua Kelas)"],
  ["wakomti", "Wakomti (Wakil Ketua)"],
  ["bendahara", "Bendahara"],
  ["sekretaris", "Sekretaris"],
  ["koordinator", "Koordinator K2"],
];

export default function OrgEditor() {
  const c = useContent("org");
  const { user } = useAuth();
  const canEdit = !!user?.webAdmin; // struktur = hak admin, jadi hanya Admin Website yang boleh mengubah
  const d = c.draft;
  if (!d) return <Loading title="Struktur Organisasi" />;
  const set = (patch: Partial<OrgData>) => canEdit && c.setDraft({ ...d, ...patch });

  return (
    <Panel title="Struktur Organisasi" desc="Atur nama pengurus yang tampil di halaman utama. Panggilan diambil otomatis dari data siswa.">
      <p
        className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${canEdit ? "border-sea-300 bg-sea-50/80 text-navy-900" : "border-amber-300 bg-amber-50 text-amber-900"}`}
      >
        {canEdit ? <ShieldCheck size={17} className="mt-0.5 shrink-0" /> : <Lock size={17} className="mt-0.5 shrink-0" />}
        <span>
          Struktur ini juga menentukan <b>siapa yang bisa membuka Panel Admin</b>: Komti, Wakomti, Bendahara, dan Sekretaris (BPH), serta Koordinator
          dan Anggota K2. Setelah disimpan, hak admin langsung berpindah.{" "}
          {canEdit ? "Kamu Admin Website, jadi tetap bisa masuk Panel Admin walau namamu tidak ada di struktur." : "Hanya Admin Website yang bisa mengubah struktur."}
        </span>
      </p>
      <fieldset disabled={!canEdit} className="m-0 min-w-0 space-y-4 border-0 p-0">
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
      </fieldset>
      {canEdit && <SaveBar dirty={c.dirty} saving={c.saving} status={c.status} onSave={() => c.save()} onReset={c.reset} />}
    </Panel>
  );
}
