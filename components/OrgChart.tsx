import { BookOpen, Camera, Crown, GraduationCap, Laptop, Shield, User, Wallet } from "lucide-react";
import type { OrgData } from "@/lib/content";
import { DIV_KEYS, ROLE_DEF, type DivKey } from "@/lib/roles";
import { STUDENTS } from "@/lib/students";

// Isi struktur diatur Admin Website di Panel Admin > Struktur & Peran. Nama disimpan sebagai nama lengkap siswa.
type Person = { nama: string; panggilan: string };
const person = (full: string): Person | undefined =>
  full ? { nama: full, panggilan: STUDENTS.find((s) => s.full === full)?.short ?? "" } : undefined;

function Connector() {
  return <div className="h-5 w-px bg-line-strong" aria-hidden="true" />;
}

// Kartu peran: navy untuk pucuk pimpinan (fokus mata), permukaan biasa untuk peran lain. Satu bahasa warna, tanpa gradasi.
function Box({ role, icon: Icon, person: p, text, lead = false, className = "" }: { role: string; icon: typeof User; person?: Person; text?: string; lead?: boolean; className?: string }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-k2-md border px-3.5 py-2.5 ${
        lead ? "border-transparent bg-[#0b1e3d] text-white dark:bg-[#165f93]" : "border-line bg-surface text-ink"
      } ${className}`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${lead ? "bg-white/15 text-[#8fcff1]" : "bg-accent-soft text-accent-ink"}`} aria-hidden="true">
        <Icon size={17} />
      </span>
      <div className="min-w-0 text-left leading-tight">
        <p className={`text-xs font-semibold ${lead ? "text-[#c9d6e6]" : "text-ink-3"}`}>{role}</p>
        {p ? (
          <p className="text-sm font-bold">
            {p.nama} {p.panggilan && <span className={`font-medium ${lead ? "text-[#c9d6e6]" : "text-ink-3"}`}>({p.panggilan})</span>}
          </p>
        ) : (
          text && <p className="text-sm font-bold">{text}</p>
        )}
      </div>
    </div>
  );
}

const DIV_ICON: Record<DivKey, typeof User> = { k2: Shield, kurikulum: GraduationCap, itl: Laptop, pubdok: Camera };

function Division({ k, org }: { k: DivKey; org: OrgData }) {
  const d = k === "k2" ? { koordinator: org.koordinator, anggota: org.anggota } : org[k];
  const anggota = d.anggota.map(person).filter((p): p is Person => !!p);
  const name = k === "k2" ? "K2" : ROLE_DEF[k].label;
  return (
    <div className="flex min-w-0 flex-col gap-2.5 rounded-k2-lg border border-line bg-surface-2 p-4">
      <p className="text-center text-sm font-semibold text-ink-2">{ROLE_DEF[k].label}</p>
      <Box role={`Koordinator ${name}`} icon={DIV_ICON[k]} person={person(d.koordinator)} text="Belum diisi" />
      {anggota.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {anggota.map((p) => (
            <li key={p.nama} className="min-w-0 rounded-k2-md border border-line bg-surface px-3 py-2 text-center">
              <p className="text-xs font-semibold text-ink-3">Anggota</p>
              <p className="truncate text-sm font-bold text-ink" title={p.nama}>
                {p.nama}
              </p>
              <p className="text-xs text-ink-3">({p.panggilan})</p>
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
        {/* Tiap level disambung garis vertikal. */}
        <div className="flex flex-col items-center">
          <Box role="DPP" icon={Crown} text={org.dpp} className="w-full max-w-[16rem]" />
          <Connector />

          <p className="mb-2 text-xs font-bold text-ink-3">Badan Pengurus Harian</p>
          <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
            <Box role="Komti" icon={User} person={person(org.komti)} lead />
            <Box role="Wakomti" icon={User} person={person(org.wakomti)} />
            <Box role="Bendahara" icon={Wallet} person={person(org.bendahara)} />
            <Box role="Sekretaris" icon={BookOpen} person={person(org.sekretaris)} />
          </div>
          <Connector />

          <p className="mb-2 text-xs font-bold text-ink-3">Divisi</p>
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
