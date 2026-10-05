import { Crown, Shield, User, Users } from "lucide-react";
import { STUDENTS } from "@/lib/students";

// Isi nama pengurus di sini. Nama yang masih kosong ("") tampil sebagai "Nama belum diisi".
const ORG = {
  dpp: "",
  komti: "",
  wakomti: "",
  koordinator: "",
  pengurus: ["", "", ""],
};

function Name({ nama, className = "" }: { nama: string; className?: string }) {
  return nama ? (
    <h4 className={`text-sm font-bold ${className}`}>{nama}</h4>
  ) : (
    <h4 className={`text-sm font-medium italic opacity-70 ${className}`}>Nama belum diisi</h4>
  );
}

function Connector() {
  return <div className="h-8 w-0.5 bg-slate-300" aria-hidden />;
}

function Tag({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span
      className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow ${className}`}
    >
      {children}
    </span>
  );
}

export default function OrgChart() {
  return (
    <section id="organisasi" className="scroll-mt-32">
      <div className="space-y-8 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.12)] md:p-10">
        <div className="mx-auto max-w-xl text-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            <Users size={14} /> Struktur Kepengurusan
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">Struktur Organisasi Kelas K2</h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Hierarki kepemimpinan dan pengurus kelas.</p>
        </div>

        {/* Tiap level disambung garis vertikal yang menempel ke kartu di atas dan di bawahnya. */}
        <div className="flex flex-col items-center pt-4">
          {/* 1. DPP */}
          <div className="relative w-full max-w-xs rounded-2xl border border-amber-400 bg-gradient-to-r from-amber-500 to-orange-500 p-4 pt-5 text-center text-white shadow-xl">
            <Tag className="bg-amber-600">DPP (Dewan Pembina)</Tag>
            <Crown size={22} className="mx-auto mb-1 text-amber-200" />
            <Name nama={ORG.dpp} className="sm:text-base" />
            <p className="text-[11px] text-amber-100">Pembina Kelas K2</p>
          </div>

          <Connector />

          {/* 2. Komti & Wakomti */}
          <div className="grid w-full max-w-lg grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
            <div className="relative rounded-2xl border border-blue-400 bg-gradient-to-r from-blue-600 to-indigo-600 p-4 pt-5 text-center text-white shadow-lg">
              <Tag className="bg-blue-700">Komti (Ketua Kelas)</Tag>
              <User size={20} className="mx-auto mb-1 text-blue-200" />
              <Name nama={ORG.komti} />
            </div>
            <div className="relative rounded-2xl border border-indigo-400 bg-gradient-to-r from-indigo-600 to-violet-600 p-4 pt-5 text-center text-white shadow-lg">
              <Tag className="bg-indigo-700">Wakomti (Wakil Ketua)</Tag>
              <User size={20} className="mx-auto mb-1 text-indigo-200" />
              <Name nama={ORG.wakomti} />
            </div>
          </div>

          <Connector />

          {/* 3. Koordinator K2 */}
          <div className="relative w-full max-w-sm rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-600 p-4 pt-5 text-center text-white shadow-xl">
            <Tag className="bg-emerald-700">Koordinator K2</Tag>
            <Shield size={20} className="mx-auto mb-1 text-emerald-200" />
            <Name nama={ORG.koordinator} />
            <p className="text-[11px] text-emerald-100">Penanggung Jawab Divisi K2</p>
          </div>

          <Connector />

          {/* 4. Tiga anggota pengurus K2 */}
          <div className="w-full max-w-3xl">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400">3 Anggota Pengurus K2</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {ORG.pengurus.map((nama, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-md transition-all hover:border-blue-400">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-xs font-bold text-blue-600">
                    {i + 1}
                  </div>
                  <Name nama={nama} className="text-slate-800" />
                  <p className="mt-0.5 text-[11px] font-semibold text-blue-600">Anggota Pengurus K2</p>
                </div>
              ))}
            </div>
          </div>

          <Connector />

          {/* 5. Anggota kelas */}
          <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Anggota Kelas K2</span>
              <p className="text-[11px] text-slate-400">Seluruh siswa dan siswi terdaftar di kelas ({STUDENTS.length} orang)</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {STUDENTS.map((s) => (
                <div key={s.full} className="rounded-xl border border-slate-200 bg-white p-3 text-center transition-all hover:shadow-sm">
                  <span className="line-clamp-2 text-xs font-semibold text-slate-700" title={s.full}>
                    {s.full}
                  </span>
                  <p className="mt-0.5 text-[10px] text-slate-400">{s.short}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
