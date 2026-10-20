import { BookOpen, Camera, Crown, GraduationCap, Laptop, Shield, User, Users, Wallet } from "lucide-react";
import type { OrgData } from "@/lib/content";
import { DIV_KEYS, ROLE_DEF, type DivKey } from "@/lib/roles";
import { STUDENTS } from "@/lib/students";

// Isi struktur diatur Admin Website di Panel Admin > Struktur & Peran. Nama disimpan sebagai nama lengkap siswa.
type Person = { nama: string; panggilan: string };
const person = (full: string): Person | undefined =>
  full ? { nama: full, panggilan: STUDENTS.find((s) => s.full === full)?.short ?? "" } : undefined;

function Connector() {
  return <div className="h-5 w-0.5 bg-slate-300" aria-hidden />;
}

// Kartu berwarna (gradien) untuk DPP, BPH, dan Koordinator.
function Box({ role, icon: Icon, person: p, text, className }: { role: string; icon: typeof User; person?: Person; text?: string; className: string }) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-white shadow-[0_12px_28px_rgba(15,23,42,0.3)] ${className}`}>
      <Icon size={18} className="shrink-0 opacity-80" />
      <div className="min-w-0 text-left leading-tight">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">{role}</p>
        {p ? (
          <p className="text-sm font-bold">
            {p.nama} {p.panggilan && <span className="font-medium opacity-80">({p.panggilan})</span>}
          </p>
        ) : (
          text && <p className="text-sm font-bold">{text}</p>
        )}
      </div>
    </div>
  );
}

const DIV_STYLE: Record<DivKey, { icon: typeof User; box: string; tag: string }> = {
  k2: { icon: Shield, box: "border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-600", tag: "text-emerald-600" },
  kurikulum: { icon: GraduationCap, box: "border-orange-400 bg-gradient-to-r from-orange-500 to-rose-500", tag: "text-orange-600" },
  itl: { icon: Laptop, box: "border-slate-500 bg-gradient-to-r from-slate-600 to-slate-800", tag: "text-slate-600" },
  pubdok: { icon: Camera, box: "border-pink-400 bg-gradient-to-r from-pink-500 to-fuchsia-600", tag: "text-pink-600" },
};

function Division({ k, org }: { k: DivKey; org: OrgData }) {
  const d = k === "k2" ? { koordinator: org.koordinator, anggota: org.anggota } : org[k];
  const s = DIV_STYLE[k];
  const anggota = d.anggota.map(person).filter((p): p is Person => !!p);
  const name = k === "k2" ? "K2" : ROLE_DEF[k].label;
  return (
    <div className="flex min-w-0 flex-col gap-2.5 rounded-k2-lg border border-line bg-surface-2 p-4">
      <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">{ROLE_DEF[k].label}</p>
      <Box role={`Koordinator ${name}`} icon={s.icon} person={person(d.koordinator)} text="Belum diisi" className={s.box} />
      {anggota.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {anggota.map((p) => (
            <li key={p.nama} className="min-w-0 rounded-k2-md border border-line bg-surface px-3 py-2 text-center shadow-1">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${s.tag}`}>Anggota</p>
              <p className="truncate text-sm font-bold text-slate-800" title={p.nama}>
                {p.nama}
              </p>
              <p className="text-[11px] text-slate-400">({p.panggilan})</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OrgChart({ org }: { org: OrgData }) {
  return (
    <section id="organisasi" className="scroll-mt-32">
      <div className="k2-card space-y-5 p-6 md:p-8">
        <div className="text-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            <Users size={14} /> Struktur Kepengurusan
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800">Pengurus Kelas ABSORBING</h2>
        </div>

        {/* Tiap level disambung garis vertikal. */}
        <div className="flex flex-col items-center">
          <Box role="DPP" icon={Crown} text={org.dpp} className="w-full max-w-[16rem] justify-center border-amber-400 bg-gradient-to-r from-amber-500 to-orange-500" />
          <Connector />

          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Badan Pengurus Harian</p>
          <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
            <Box role="Komti" icon={User} person={person(org.komti)} className="border-blue-400 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <Box role="Wakomti" icon={User} person={person(org.wakomti)} className="border-indigo-400 bg-gradient-to-r from-indigo-600 to-violet-600" />
            <Box role="Bendahara" icon={Wallet} person={person(org.bendahara)} className="border-sky-400 bg-gradient-to-r from-sky-600 to-blue-600" />
            <Box role="Sekretaris" icon={BookOpen} person={person(org.sekretaris)} className="border-violet-400 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
          </div>
          <Connector />

          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Divisi</p>
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
            {DIV_KEYS.map((k) => (
              <Division key={k} k={k} org={org} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
