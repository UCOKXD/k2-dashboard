import { BookOpen, Crown, Shield, User, Users, Wallet } from "lucide-react";
import type { OrgData } from "@/lib/content";
import { STUDENTS } from "@/lib/students";

// Isi struktur diatur admin di Panel Admin > Struktur. Nama disimpan sebagai nama lengkap siswa.
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

export default function OrgChart({ org }: { org: OrgData }) {
  const anggota = org.anggota.map(person).filter((p): p is Person => !!p);
  return (
    <section id="organisasi" className="scroll-mt-32">
      <div className="space-y-5 rounded-[2.5rem] border border-white/60 bg-white/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.24)] backdrop-blur-md md:p-8">
        <div className="text-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            <Users size={14} /> Struktur Kepengurusan
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800">Struktur K2 ABSORBING</h2>
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

          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Kesiswaan &amp; Kedisiplinan (K2)</p>
          <Box role="Koordinator K2" icon={Shield} person={person(org.koordinator)} className="w-full max-w-sm border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-600" />
          {anggota.length > 0 && (
            <>
              <Connector />
              <div className={`grid w-full max-w-2xl grid-cols-1 gap-3 ${anggota.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                {anggota.map((p) => (
                  <div key={p.nama} className="min-w-0 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition-all hover:border-blue-400">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Anggota K2</p>
                    <p className="text-sm font-bold text-slate-800">{p.nama}</p>
                    <p className="text-[11px] text-slate-400">({p.panggilan})</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
