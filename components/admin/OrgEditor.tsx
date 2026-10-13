"use client";
import { Lock, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import type { OrgData } from "@/lib/content";
import { DIV_KEYS, PERMS, ROLE_DEF, ROLE_DEFS, type DivKey, type Divisi, type PermKey, type RoleKey } from "@/lib/roles";
import { Panel, SaveBar, StudentSelect, input, smallBtn, useContent, Loading } from "@/components/admin/ui";

const BPH: [keyof Pick<OrgData, "komti" | "wakomti" | "bendahara" | "sekretaris">, string][] = [
  ["komti", "Komti (Ketua Kelas)"],
  ["wakomti", "Wakomti (Wakil Ketua)"],
  ["bendahara", "Bendahara"],
  ["sekretaris", "Sekretaris"],
];
const MAX_ANGGOTA = 8;

// Struktur pengurus + hak akses tiap peran. Khusus Admin Website (menentukan siapa bisa memakai fitur admin apa).
export default function OrgEditor() {
  const c = useContent("org");
  const { user } = useAuth();
  const canEdit = !!user?.webAdmin;
  const d = c.draft;
  if (!d) return <Loading title="Struktur & Peran" />;
  const set = (patch: Partial<OrgData>) => canEdit && c.setDraft({ ...d, ...patch });

  const divOf = (k: DivKey): Divisi => (k === "k2" ? { koordinator: d.koordinator, anggota: d.anggota } : d[k]);
  const setDiv = (k: DivKey, v: Divisi) => (k === "k2" ? set({ koordinator: v.koordinator, anggota: v.anggota }) : set({ [k]: v } as Partial<OrgData>));
  const toggle = (r: RoleKey, p: PermKey, on: boolean) =>
    set({ izin: { ...d.izin, [r]: on ? [...new Set([...d.izin[r], p])] : d.izin[r].filter((x) => x !== p) } });

  return (
    <div className="space-y-6">
      <Panel title="Struktur & Peran" desc="Atur pengurus kelas tiap cawu. Struktur ini tampil di halaman utama dan menentukan fitur Panel Admin yang bisa dipakai tiap orang.">
        <p
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${canEdit ? "border-sea-300 bg-sea-50/80 text-navy-900" : "border-amber-300 bg-amber-50 text-amber-900"}`}
        >
          {canEdit ? <ShieldCheck size={17} className="mt-0.5 shrink-0" /> : <Lock size={17} className="mt-0.5 shrink-0" />}
          <span>
            Setelah disimpan, hak akses langsung berpindah ke pengurus baru. <b>Admin Website</b> (pemilik web) selalu punya akses penuh, termasuk
            Struktur & Peran dan Notifikasi WA, walau namanya tidak tercantum di struktur.
            {!canEdit && " Hanya Admin Website yang bisa mengubah struktur."}
          </span>
        </p>
        <fieldset disabled={!canEdit} className="m-0 min-w-0 space-y-5 border-0 p-0">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">DPP (Dewan Pembina)</span>
            <input value={d.dpp} onChange={(e) => set({ dpp: e.target.value })} placeholder="Kosongkan agar hanya tertulis DPP" className={input} />
          </label>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="font-bold text-slate-800">Badan Pengurus Harian (BPH)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {BPH.map(([k, label]) => (
                <label key={k} className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                  <StudentSelect value={d[k]} onChange={(v) => set({ [k]: v } as Partial<OrgData>)} />
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {DIV_KEYS.map((k) => {
              const v = divOf(k);
              return (
                <div key={k} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-bold text-slate-800">{ROLE_DEF[k].label}</p>
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-slate-700">Koordinator</span>
                    <StudentSelect value={v.koordinator} onChange={(x) => setDiv(k, { ...v, koordinator: x })} />
                  </label>
                  <p className="pt-1 text-sm font-semibold text-slate-700">Anggota</p>
                  {v.anggota.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <StudentSelect value={a} onChange={(x) => setDiv(k, { ...v, anggota: v.anggota.map((y, j) => (j === i ? x : y)) })} />
                      <button onClick={() => setDiv(k, { ...v, anggota: v.anggota.filter((_, j) => j !== i) })} className={smallBtn} aria-label={`Hapus anggota ${ROLE_DEF[k].short}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {v.anggota.length < MAX_ANGGOTA && (
                    <button onClick={() => setDiv(k, { ...v, anggota: [...v.anggota, ""] })} className={`${smallBtn} flex items-center gap-1`}>
                      <Plus size={13} /> Tambah anggota
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      </Panel>

      <Panel title="Hak Akses Tiap Peran" desc="Centang fitur Panel Admin yang boleh dipakai tiap peran (koordinator dan anggota divisi mendapat akses yang sama). Siswa tanpa peran hanya bisa melihat.">
        <fieldset disabled={!canEdit} className="m-0 min-w-0 border-0 p-0">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-100 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2.5 uppercase tracking-wider">Peran</th>
                  {PERMS.map((p) => (
                    <th key={p.key} title={p.desc} className="px-2 py-2.5 text-center font-semibold">
                      {p.label}
                    </th>
                  ))}
                  <th className="px-2 py-2.5 text-center font-semibold" title="Struktur & Peran, Notifikasi WA (bot)">
                    Struktur & Bot
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROLE_DEFS.map((r) => (
                  <tr key={r.key} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-800">{r.label}</td>
                    {PERMS.map((p) => (
                      <td key={p.key} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={d.izin[r.key].includes(p.key)}
                          onChange={(e) => toggle(r.key, p.key, e.target.checked)}
                          className="h-4 w-4 accent-sea-500"
                          aria-label={`${r.label}: ${p.label}`}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center text-xs text-slate-400" title="Khusus Admin Website">
                      <Lock size={13} className="mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>
        <ul className="grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
          {PERMS.map((p) => (
            <li key={p.key}>
              <b className="text-slate-700">{p.label}</b>: {p.desc}
            </li>
          ))}
        </ul>
        {canEdit && <SaveBar dirty={c.dirty} saving={c.saving} status={c.status} onSave={() => c.save()} onReset={c.reset} />}
      </Panel>
    </div>
  );
}
