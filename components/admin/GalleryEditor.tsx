"use client";
import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Panel, SaveBar, input, newId, smallBtn, uploadImage, useContent, Loading } from "@/components/admin/ui";

export default function GalleryEditor() {
  const { user } = useAuth();
  const c = useContent("gallery");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const d = c.draft;
  if (!d) return <Loading title="Galeri" />;

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setErr("");
    const added = [];
    for (const f of [...files].slice(0, 20)) {
      try {
        added.push({ id: newId(), src: await uploadImage(f), caption: "", at: new Date().toISOString(), by: user?.panggilan ?? "" });
      } catch (e) {
        setErr(`${f.name}: ${(e as Error).message}`);
      }
    }
    c.setDraft([...added, ...d!]);
    setUploading(false);
  }

  return (
    <Panel title="Galeri Kelas" desc="Foto dokumentasi kegiatan di halaman Galeri. Tambahkan keterangan singkat, lalu Simpan. Foto galeri juga tampil acak di banner beranda dan latar jam halaman Waktu.">
      <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sea-300 bg-sea-50/60 py-6 text-sm font-semibold text-sea-600 ${uploading ? "opacity-60" : "hover:bg-sea-50"}`}>
        <ImagePlus size={20} /> {uploading ? "Mengunggah..." : "Pilih foto (bisa beberapa sekaligus)"}
        <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={(e) => add(e.target.files)} />
      </label>
      {err && <p className="text-sm text-rose-600">{err}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {d.map((it) => (
          <div key={it.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.src} alt={it.caption || "Foto"} className="aspect-video w-full object-cover" />
            <div className="flex gap-2 p-2">
              <input value={it.caption} onChange={(e) => c.setDraft(d.map((x) => (x.id === it.id ? { ...x, caption: e.target.value } : x)))} placeholder="Keterangan foto" className={input} />
              <button onClick={() => c.setDraft(d.filter((x) => x.id !== it.id))} className={`${smallBtn} text-rose-600`} aria-label="Hapus foto">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <SaveBar dirty={c.dirty} saving={c.saving || uploading} status={c.status} onSave={() => c.save()} onReset={c.reset} />
    </Panel>
  );
}
