"use client";
import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import { avatarSrc, refreshAvatars, useAvatars } from "@/components/useAvatars";

const SIZE = 320; // px, persegi

// Potong tengah jadi persegi lalu kecilkan & kompres di browser supaya ringan disimpan.
async function toSquare(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => fail(new Error("Gambar tidak bisa dibuka"));
      i.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const c = document.createElement("canvas");
    c.width = c.height = SIZE;
    c.getContext("2d")!.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, SIZE, SIZE);
    const webp = c.toDataURL("image/webp", 0.85);
    return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Bagian "Foto Profil" di halaman Akun: tampil di tombol akun, daftar teman NGL, dan banner ulang tahun.
export default function ProfilePhoto() {
  const { user } = useAuth();
  const avatars = useAvatars();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!user) return null;
  const src = avatarSrc(avatars, user.absen);

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const data = await toSquare(file);
      await adminFetch("/api/avatar", "POST", { data });
      await refreshAvatars();
      setMsg({ ok: true, text: "Foto profil tersimpan." });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  async function remove() {
    if (!confirm("Hapus foto profil?")) return;
    setBusy(true);
    setMsg(null);
    try {
      await adminFetch("/api/avatar", "DELETE");
      await refreshAvatars();
      setMsg({ ok: true, text: "Foto profil dihapus." });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
    setBusy(false);
  }

  const locked = user.tempPassword;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-sea-500 to-navy-700 font-display text-3xl font-bold text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt={`Foto profil ${user.panggilan}`} className="h-full w-full object-cover" /> : user.panggilan[0]}
      </span>
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || locked}
            onClick={() => input.current?.click()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0b1e3d] px-4 text-sm font-semibold text-white transition hover:bg-[#1b3a6b] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#2e9be0] dark:text-[#061227]"
          >
            <Camera size={16} /> {busy ? "Memproses..." : src ? "Ganti foto" : "Pasang foto"}
          </button>
          {src && (
            <button
              type="button"
              disabled={busy || locked}
              onClick={remove}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-bad transition hover:border-bad disabled:opacity-45"
            >
              <Trash2 size={15} /> Hapus
            </button>
          )}
        </div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => pick(e.target.files?.[0])} />
        <p className="text-[13px] text-ink-3">
          {locked ? "Ganti password awal dulu sebelum memasang foto." : "JPG, PNG, atau WebP. Dipotong jadi persegi otomatis. Foto langsung terlihat teman sekelas, jadi pakai foto yang sopan."}
        </p>
        {msg && (
          <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-ok" : "text-bad"}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}
