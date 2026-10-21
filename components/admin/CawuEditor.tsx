"use client";
import { useState } from "react";
import { Copy, Info, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { CAWU_MAX, EMPTY_PEOPLE, SOCIAL_MAX, SOCIAL_TYPES, peopleOf, type OrgPeople, type SocialLink } from "@/lib/content";
import { DIV_KEYS, ROLE_DEF, type DivKey, type Divisi } from "@/lib/roles";
import { Loading, Panel, SaveBar, StudentSelect, input, smallBtn, useContent } from "@/components/admin/ui";

const BPH: [keyof Pick<OrgPeople, "komti" | "wakomti" | "sekretaris" | "bendahara">, string][] = [
  ["komti", "Komti (Ketua Kelas)"],
  ["wakomti", "Wakomti (Wakil Ketua)"],
  ["sekretaris", "Sekretaris"],
  ["bendahara", "Bendahara"],
];
const MAX_ANGGOTA = 8;

// Isian pengurus satu CAWU (tanpa hak akses).
function PeopleFields({ d, set }: { d: OrgPeople; set: (p: Partial<OrgPeople>) => void }) {
  const divOf = (k: DivKey): Divisi => (k === "k2" ? { koordinator: d.koordinator, anggota: d.anggota } : d[k]);
  const setDiv = (k: DivKey, v: Divisi) => (k === "k2" ? set({ koordinator: v.koordinator, anggota: v.anggota }) : set({ [k]: v } as Partial<OrgPeople>));
  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="font-bold text-slate-800">Badan Pengurus Harian (BPH)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {BPH.map(([k, label]) => (
            <label key={k} className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <StudentSelect value={d[k]} onChange={(v) => set({ [k]: v } as Partial<OrgPeople>)} />
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
                  <button onClick={() => setDiv(k, { ...v, anggota: v.anggota.filter((_, j) => j !== i) })} className={smallBtn} aria-label="Hapus anggota">
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
    </div>
  );
}

// Struktur pengurus CAWU 1–6 untuk halaman Profil (khusus Admin Website). CAWU aktif mengikuti Struktur & Peran.
export function CawuEditor() {
  const c = useContent("cawu");
  const org = useContent("org");
  const { user } = useAuth();
  const [n, setN] = useState<number | null>(null);
  const d = c.draft;
  if (!d || !org.draft) return <Loading title="Struktur per CAWU" />;
  const canEdit = !!user?.webAdmin;
  const sel = n ?? d.current;
  const isCurrent = sel === d.current;
  const people = d.snaps[sel] ?? EMPTY_PEOPLE;
  const setPeople = (patch: Partial<OrgPeople>) => canEdit && c.setDraft({ ...d, snaps: { ...d.snaps, [sel]: { ...people, ...patch } } });

  return (
    <div className="space-y-6">
      <Panel title="Struktur per CAWU" desc="Pengurus tiap CAWU yang tampil di halaman Profil (pilihan CAWU 1–6 di kanan atas).">
        <fieldset disabled={!canEdit} className="m-0 min-w-0 space-y-5 border-0 p-0">
          <div className="flex flex-wrap items-end gap-4">
            <label className="space-y-1">
              <span className="block text-sm font-semibold text-slate-700">CAWU yang sedang berjalan</span>
              <select value={d.current} onChange={(e) => c.setDraft({ ...d, current: Number(e.target.value) })} className={`${input} w-40`}>
                {Array.from({ length: CAWU_MAX }, (_, i) => i + 1).map((x) => (
                  <option key={x} value={x}>
                    CAWU {x}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-semibold text-slate-700">Edit pengurus</span>
              <select value={sel} onChange={(e) => setN(Number(e.target.value))} className={`${input} w-40`}>
                {Array.from({ length: CAWU_MAX }, (_, i) => i + 1).map((x) => (
                  <option key={x} value={x}>
                    CAWU {x}
                    {x === d.current ? " (berjalan)" : d.snaps[x] ? "" : " (kosong)"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!canEdit && <p className="text-sm font-medium text-amber-700">Hanya Admin Website yang bisa mengubah struktur per CAWU.</p>}

          {isCurrent ? (
            <p className="flex items-start gap-2 rounded-2xl border border-sea-300 bg-sea-50/80 px-4 py-3 text-sm text-navy-900">
              <Info size={17} className="mt-0.5 shrink-0" />
              <span>
                CAWU {sel} sedang berjalan, jadi halaman Profil memakai pengurus dari tab <b>Struktur &amp; Peran</b> (yang juga menentukan hak akses). Ubah pengurusnya di sana. Saat
                pindah CAWU, salin dulu ke CAWU ini supaya tetap tersimpan sebagai riwayat.
              </span>
            </p>
          ) : (
            <>
              <button type="button" onClick={() => setPeople(peopleOf(org.draft!))} className={`${smallBtn} inline-flex items-center gap-1`}>
                <Copy size={13} /> Salin dari Struktur &amp; Peran sekarang
              </button>
              <PeopleFields d={people} set={setPeople} />
            </>
          )}
          {isCurrent && (
            <button type="button" onClick={() => c.setDraft({ ...d, snaps: { ...d.snaps, [sel]: peopleOf(org.draft!) } })} className={`${smallBtn} inline-flex items-center gap-1`}>
              <Copy size={13} /> Simpan struktur sekarang sebagai arsip CAWU {sel}
            </button>
          )}
        </fieldset>
      </Panel>
      <SaveBar dirty={c.dirty} saving={c.saving} status={c.status} onSave={() => c.save()} onReset={c.reset} />
    </div>
  );
}

const SOCIAL_LABEL: Record<(typeof SOCIAL_TYPES)[number], string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", email: "Email", whatsapp: "WhatsApp", link: "Link lain" };

// Media sosial kelas di footer (khusus Admin Website).
export function FooterEditor() {
  const c = useContent("footer");
  const { user } = useAuth();
  const d = c.draft;
  if (!d) return <Loading title="Media Sosial" />;
  const canEdit = !!user?.webAdmin;
  const set = (socials: SocialLink[]) => canEdit && c.setDraft({ socials });
  return (
    <div className="space-y-6">
      <Panel title="Media Sosial di Footer" desc="Tampil di bagian paling bawah semua halaman. Kosongkan untuk menyembunyikan. Tulisan hak cipta selalu tampil.">
        <fieldset disabled={!canEdit} className="m-0 min-w-0 space-y-3 border-0 p-0">
          {d.socials.map((x, i) => (
            <div key={i} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[150px_1fr_1.5fr_auto]">
              <select value={x.type} onChange={(e) => set(d.socials.map((y, j) => (j === i ? { ...y, type: e.target.value as SocialLink["type"] } : y)))} className={input}>
                {SOCIAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {SOCIAL_LABEL[t]}
                  </option>
                ))}
              </select>
              <input value={x.label} onChange={(e) => set(d.socials.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} placeholder="Teks, mis. ppti28_absorbing" className={input} />
              <input
                value={x.url.replace(/^mailto:/, "")}
                onChange={(e) => set(d.socials.map((y, j) => (j === i ? { ...y, url: e.target.value } : y)))}
                placeholder={x.type === "email" ? "alamat@email.com" : "https://..."}
                className={`${input} font-mono`}
              />
              <button onClick={() => set(d.socials.filter((_, j) => j !== i))} className={smallBtn} aria-label="Hapus media sosial">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {d.socials.length < SOCIAL_MAX && (
            <button onClick={() => set([...d.socials, { type: "instagram", label: "", url: "" }])} className={`${smallBtn} inline-flex items-center gap-1`}>
              <Plus size={13} /> Tambah media sosial
            </button>
          )}
          {!canEdit && <p className="text-sm font-medium text-amber-700">Hanya Admin Website yang bisa mengubah media sosial.</p>}
        </fieldset>
      </Panel>
      <SaveBar dirty={c.dirty} saving={c.saving} status={c.status} onSave={() => c.save()} onReset={c.reset} />
    </div>
  );
}
