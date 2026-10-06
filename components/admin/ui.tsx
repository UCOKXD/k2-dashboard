"use client";
import { useCallback, useEffect, useState } from "react";
import { Save, Undo2 } from "lucide-react";
import { adminFetch } from "@/components/AuthProvider";
import type { ContentKey, ContentOf } from "@/lib/content";
import { STUDENTS } from "@/lib/students";

// Gaya isian tanpa lebar (inputBase) dan versi selebar kolom (input).
export const inputBase =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sea-500 focus:ring-2 focus:ring-sea-500/30";
export const input = `w-full ${inputBase}`;
export const smallBtn = "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40";

export function Panel({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.22)] backdrop-blur-md sm:p-7">
      <div>
        <h3 className="text-lg font-extrabold text-navy-900">{title}</h3>
        {desc && <p className="text-sm text-slate-500">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

// Baca satu dokumen konten, ubah sebagai draf, lalu simpan. "dirty" = ada perubahan belum disimpan.
export function useContent<K extends ContentKey>(key: K) {
  const [saved, setSaved] = useState<ContentOf<K> | null>(null);
  const [draft, setDraft] = useState<ContentOf<K> | null>(null);
  const [status, setStatus] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/content/${key}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { data: ContentOf<K> }) => {
        setSaved(d.data);
        setDraft(d.data);
      })
      .catch(() => setStatus({ type: "err", text: "Gagal memuat data" }));
  }, [key]);

  const save = useCallback(
    async (value?: ContentOf<K>) => {
      setSaving(true);
      setStatus(null);
      try {
        const r = await adminFetch<{ data: ContentOf<K> }>(`/api/content/${key}`, "PUT", value ?? draft);
        setSaved(r.data);
        setDraft(r.data);
        setStatus({ type: "ok", text: "Tersimpan. Halaman publik sudah diperbarui." });
      } catch (e) {
        setStatus({ type: "err", text: (e as Error).message });
      }
      setSaving(false);
    },
    [key, draft]
  );

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  return { draft, setDraft, save, saving, status, dirty, reset: () => setDraft(saved) };
}

export function SaveBar({ dirty, saving, status, onSave, onReset }: { dirty: boolean; saving: boolean; status: { type: "ok" | "err"; text: string } | null; onSave: () => void; onReset: () => void }) {
  return (
    <div className={`${dirty ? "sticky bottom-3" : ""} z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_14px_34px_rgba(15,23,42,0.22)] backdrop-blur-md`}>
      <p className={`text-sm font-medium ${status?.type === "err" ? "text-rose-600" : status ? "text-emerald-600" : dirty ? "text-amber-700" : "text-slate-400"}`}>
        {status?.text ?? (dirty ? "Ada perubahan yang belum disimpan." : "Tidak ada perubahan.")}
      </p>
      <div className="flex gap-2">
        <button onClick={onReset} disabled={!dirty || saving} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">
          <Undo2 size={14} /> Batalkan
        </button>
        <button onClick={onSave} disabled={!dirty || saving} className="flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow disabled:opacity-40">
          <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  );
}

export function StudentSelect({ value, onChange, empty = "— kosong —", className = "" }: { value: string; onChange: (v: string) => void; empty?: string; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${input} ${className}`}>
      <option value="">{empty}</option>
      {STUDENTS.map((s) => (
        <option key={s.full} value={s.full}>
          {s.absen}. {s.full} ({s.short})
        </option>
      ))}
    </select>
  );
}

// Perkecil foto di browser (maks 1600 px, JPEG) supaya cepat diunggah dan hemat penyimpanan.
export async function compressImage(file: File, max = 1600, quality = 0.8): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => fail(new Error("File bukan gambar yang bisa dibuka"));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadImage(file: File): Promise<string> {
  const data = await compressImage(file);
  const r = await adminFetch<{ src: string }>("/api/media", "POST", { data });
  return r.src;
}

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// Pilihan jam 24 jam (00-23) dan menit (00-59) supaya tidak pernah muncul AM/PM seperti kotak jam bawaan browser.
export function TimeSelect({ value, onChange, optional = false, label }: { value: string; onChange: (v: string) => void; optional?: boolean; label: string }) {
  const [h = "", m = ""] = value ? value.split(":") : [];
  const pad = (n: number) => String(n).padStart(2, "0");
  const emit = (hh: string, mm: string) => onChange(hh === "" ? "" : `${hh}:${mm || "00"}`);
  return (
    <div className="flex items-center gap-1" aria-label={label}>
      <select value={h} onChange={(e) => emit(e.target.value, m)} className={`${inputBase} w-[4.25rem] px-2 py-1.5`} aria-label={`${label} (jam)`}>
        <option value="">{optional ? "--" : "Jam"}</option>
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={pad(i)}>
            {pad(i)}
          </option>
        ))}
      </select>
      <span className="font-bold text-slate-400">.</span>
      <select value={h ? m : ""} disabled={!h} onChange={(e) => emit(h, e.target.value)} className={`${inputBase} w-[4.25rem] px-2 py-1.5 disabled:opacity-50`} aria-label={`${label} (menit)`}>
        {!h && <option value="">--</option>}
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={pad(i)}>
            {pad(i)}
          </option>
        ))}
      </select>
      {optional && h && (
        <button type="button" onClick={() => onChange("")} className="px-1 text-xs text-slate-400 hover:text-rose-600" aria-label={`Kosongkan ${label}`}>
          ×
        </button>
      )}
    </div>
  );
}

const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Pilihan tanggal urut Indonesia (tgl - bulan - tahun), nilai tetap "YYYY-MM-DD".
export function DateSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [y = "", m = "", d = ""] = value ? value.split("-") : [];
  const nowY = Number(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).slice(0, 4));
  const years = Array.from({ length: 5 }, (_, i) => String(nowY - 1 + i));
  if (y && !years.includes(y)) years.unshift(y);
  const pad = (n: number) => String(n).padStart(2, "0");
  const max = y && m ? new Date(Number(y), Number(m), 0).getDate() : 31;
  // Isi otomatis bagian yang masih kosong supaya hasilnya selalu tanggal yang sah.
  const emit = (yy: string, mm: string, dd: string) => {
    if (!yy && !mm && !dd) return onChange("");
    const Y = yy || String(nowY);
    const M = mm || "01";
    const last = new Date(Number(Y), Number(M), 0).getDate();
    const D = pad(Math.min(Number(dd || "1"), last));
    onChange(`${Y}-${M}-${D}`);
  };
  const cls = `${inputBase} px-2 py-1.5`;
  return (
    <div className="flex items-center gap-1" aria-label={label}>
      <select value={d} onChange={(e) => emit(y, m, e.target.value)} className={`${cls} w-[4.25rem]`} aria-label={`${label} (tanggal)`}>
        <option value="">Tgl</option>
        {Array.from({ length: max }, (_, i) => (
          <option key={i} value={pad(i + 1)}>
            {i + 1}
          </option>
        ))}
      </select>
      <select value={m} onChange={(e) => emit(y, e.target.value, d)} className={`${cls} w-[4.75rem]`} aria-label={`${label} (bulan)`}>
        <option value="">Bln</option>
        {BULAN_PENDEK.map((b, i) => (
          <option key={b} value={pad(i + 1)}>
            {b}
          </option>
        ))}
      </select>
      <select value={y} onChange={(e) => emit(e.target.value, m, d)} className={`${cls} w-[5.25rem]`} aria-label={`${label} (tahun)`}>
        <option value="">Thn</option>
        {years.map((yy) => (
          <option key={yy} value={yy}>
            {yy}
          </option>
        ))}
      </select>
    </div>
  );
}
