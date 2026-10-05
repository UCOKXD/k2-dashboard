import { Crown, Shield, User, Users } from "lucide-react";

// Pengurus K2 ABSORBING. DPP sengaja tanpa nama.
const ORG = {
  komti: { nama: "Maria Godeliva Alexandra", panggilan: "Maria" },
  wakomti: { nama: "Michael Aristo Bima Putra", panggilan: "Michael" },
  koordinator: { nama: "Francis Demetrio Villanova", panggilan: "Ancis" },
  anggota: [
    { nama: "Celine Jessica", panggilan: "Celine" },
    { nama: "Demetra Sandrea Suniadji", panggilan: "Dea" },
    { nama: "Tania Audrey Susanto", panggilan: "Tania" },
  ],
};

type Person = { nama: string; panggilan: string };

function Connector() {
  return <div className="h-5 w-0.5 bg-slate-300" aria-hidden />;
}

// Kartu berwarna (gradien) untuk DPP, Komti, Wakomti, Koordinator.
function Box({ role, icon: Icon, person, className }: { role: string; icon: typeof User; person?: Person; className: string }) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-white shadow-[0_12px_28px_rgba(15,23,42,0.3)] ${className}`}>
      <Icon size={18} className="shrink-0 opacity-80" />
      <div className="min-w-0 text-left leading-tight">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">{role}</p>
        {person && (
          <p className="text-sm font-bold">
            {person.nama} <span className="font-medium opacity-80">({person.panggilan})</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function OrgChart() {
  return (
    <section id="organisasi" className="scroll-mt-32">
      <div className="space-y-5 rounded-[2.5rem] border border-slate-200/70 bg-white/70 backdrop-blur-md p-6 shadow-[0_30px_80px_rgba(15,23,42,0.24)] md:p-8">
        <div className="text-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            <Users size={14} /> Struktur Kepengurusan
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800">Struktur K2 ABSORBING</h2>
        </div>

        {/* Tiap level disambung garis vertikal. */}
        <div className="flex flex-col items-center">
          <Box role="DPP" icon={Crown} className="w-full max-w-[12rem] justify-center border-amber-400 bg-gradient-to-r from-amber-500 to-orange-500" />
          <Connector />
          <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            <Box role="Komti" icon={User} person={ORG.komti} className="border-blue-400 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <Box role="Wakomti" icon={User} person={ORG.wakomti} className="border-indigo-400 bg-gradient-to-r from-indigo-600 to-violet-600" />
          </div>
          <Connector />
          <Box role="Koordinator K2" icon={Shield} person={ORG.koordinator} className="w-full max-w-sm border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-600" />
          <Connector />
          <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {ORG.anggota.map((p) => (
              <div key={p.nama} className="min-w-0 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md px-3 py-2.5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition-all hover:border-blue-400">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Anggota K2</p>
                <p className="text-sm font-bold text-slate-800">{p.nama}</p>
                <p className="text-[11px] text-slate-400">({p.panggilan})</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
