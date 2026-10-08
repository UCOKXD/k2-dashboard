"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { Panel, SaveBar, newId, smallBtn, uploadImage, useContent, Loading } from "@/components/admin/ui";

export default function SlidesEditor() {
  const c = useContent("slides");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const d = c.draft;
  if (!d) return <Loading title="Foto Banner" />;

  const move = (i: number, by: number) => {
    const items = [...d.items];
    [items[i], items[i + by]] = [items[i + by], items[i]];
    c.setDraft({ ...d, items });
  };

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setErr("");
    const items = [...d!.items];
    for (const f of [...files].slice(0, 12 - items.length)) {
      try {
        items.push({ id: newId(), src: await uploadImage(f) });
      } catch (e) {
        setErr(`${f.name}: ${(e as Error).message}`);
      }
    }
    c.setDraft({ ...d!, items });
    setUploading(false);
  }

  return (
    <Panel title="Foto Banner Halaman Utama" desc="Foto bergantian di banner besar halaman utama (bukan header). Maksimal 12 foto; foto otomatis diperkecil sebelum diunggah. Kalau Galeri sudah berisi, banner dan latar jam halaman Waktu juga mengambil foto acak dari Galeri.">
      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-700">Lama tiap foto: {d.duration} detik</span>
        <input type="range" min={3} max={30} value={d.duration} onChange={(e) => c.setDraft({ ...d, duration: Number(e.target.value) })} className="w-full max-w-md accent-sea-500" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {d.items.map((it, i) => (
          <div key={it.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.src} alt={`Foto ${i + 1}`} className="aspect-video w-full object-cover" />
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-slate-500">Foto {i + 1}</span>
              <div className="flex gap-1.5">
                <button onClick={() => move(i, -1)} disabled={i === 0} className={smallBtn} aria-label="Geser ke kiri">
                  <ArrowUp size={13} className="-rotate-90" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === d.items.length - 1} className={smallBtn} aria-label="Geser ke kanan">
                  <ArrowDown size={13} className="-rotate-90" />
                </button>
                <button onClick={() => c.setDraft({ ...d, items: d.items.filter((x) => x.id !== it.id) })} disabled={d.items.length <= 1} className={`${smallBtn} text-rose-600`} aria-label="Hapus foto">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {d.items.length < 12 && (
          <label className={`grid aspect-video cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-sea-300 bg-sea-50/60 text-sm font-semibold text-sea-600 ${uploading ? "opacity-60" : "hover:bg-sea-50"}`}>
            <span className="flex flex-col items-center gap-1">
              <ImagePlus size={22} /> {uploading ? "Mengunggah..." : "Tambah foto"}
            </span>
            <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={(e) => add(e.target.files)} />
          </label>
        )}
      </div>
      {err && <p className="text-sm text-rose-600">{err}</p>}
      <SaveBar dirty={c.dirty} saving={c.saving || uploading} status={c.status} onSave={() => c.save()} onReset={c.reset} />
    </Panel>
  );
}
