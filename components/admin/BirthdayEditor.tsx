"use client";
import { useState } from "react";
import { STUDENTS } from "@/lib/students";
import { Panel, SaveBar, input, useContent } from "@/components/admin/ui";

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Tanggal & bulan lahir tiap siswa (tanpa tahun). Ucapan muncul di halaman utama pada hari-H, pengingat 7 hari sebelumnya.
export default function BirthdayEditor() {
  const c = useContent("birthdays");
  const [q, setQ] = useState("");
  const [partial, setPartial] = useState<Record<string, { day: string; month: string }>>({}); // pilihan yang baru setengah (tgl atau bulan saja)
  const d = c.draft;
  if (!d) return <Panel title="Ulang Tahun">Memuat...</Panel>;

  const set = (nama: string, day: string, month: string) => {
    const next = { ...d };
    if (day && month) next[nama] = `${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    else delete next[nama];
    setPartial((p) => ({ ...p, [nama]: { day, month } }));
    c.setDraft(next);
  };
  const filled = Object.keys(d).length;
  const list = STUDENTS.filter((s) => !q || s.full.toLowerCase().includes(q.toLowerCase()) || s.short.toLowerCase().includes(q.toLowerCase()));

  return (
    <Panel title="Ulang Tahun Siswa" desc={`Isi tanggal & bulan lahir. Sudah terisi ${filled} dari ${STUDENTS.length} siswa.`}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama..." className={`${input} max-w-xs`} />
      <div className="grid gap-2 md:grid-cols-2">
        {list.map((s) => {
          const [mm = "", dd0 = ""] = (d[s.full] ?? "").split("-");
          const day = dd0 ? String(Number(dd0)) : (partial[s.full]?.day ?? "");
          const month = mm ? String(Number(mm)) : (partial[s.full]?.month ?? "");
          return (
            <div key={s.full} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700" title={s.full}>
                {s.absen}. {s.full}
              </span>
              <select value={day} onChange={(e) => set(s.full, e.target.value, month)} className={`${input} w-20 px-2 py-1.5`} aria-label="Tanggal">
                <option value="">Tgl</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select value={month} onChange={(e) => set(s.full, day, e.target.value)} className={`${input} w-32 px-2 py-1.5`} aria-label="Bulan">
                <option value="">Bulan</option>
                {BULAN.map((b, i) => (
                  <option key={b} value={i + 1}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <SaveBar dirty={c.dirty} saving={c.saving} status={c.status} onSave={() => c.save()} onReset={c.reset} />
    </Panel>
  );
}
