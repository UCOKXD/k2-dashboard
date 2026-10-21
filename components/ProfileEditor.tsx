"use client";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Save, Trash2 } from "lucide-react";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import InstagramButton from "@/components/InstagramButton";
import { compressImage } from "@/components/imageTools";
import { type ProfileData, fetchProfile, postSrc } from "@/components/ProfileView";
import { input } from "@/components/admin/ui";

const BIO_MAX = 150;
const btn =
  "inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0b1e3d] px-4 text-sm font-semibold text-white transition hover:bg-[#1b3a6b] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#2e9be0] dark:text-[#061227]";

function Status({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-ok" : "text-bad"}`}>
      {msg.text}
    </p>
  );
}

async function run(fn: () => Promise<unknown>, done: string, set: (m: { ok: boolean; text: string }) => void) {
  try {
    await fn();
    set({ ok: true, text: done });
    return true;
  } catch (e) {
    set({ ok: false, text: (e as Error).message });
    return false;
  }
}

// Ganti username (dipakai untuk masuk). Lupa username? Admin mereset → kembali ke username awal.
export function UsernameForm() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.login ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!user) return null;
  const same = name.trim() === user.login;
  return (
    <form
      className="space-y-2.5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        if (await run(() => adminFetch("/api/auth/username", "POST", { username: name.trim() }), `Username sekarang ${name.trim()}. Pakai username ini saat masuk berikutnya.`, setMsg)) await refresh();
        setBusy(false);
      }}
    >
      <div className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoCapitalize="none" spellCheck={false} className={`${input} w-full max-w-xs font-mono`} aria-label="Username baru" />
        <button disabled={busy || same || !name.trim()} className={btn}>
          <Save size={15} /> Simpan
        </button>
      </div>
      <p className="text-[13px] text-ink-3">
        3–20 karakter: huruf, angka, titik, atau garis bawah. Username awal: <span className="font-mono">{user.username}</span> (isi itu untuk kembali). Lupa username atau password? Minta pengurus BPH atau K2
        mereset; username dan password kembali ke awal.
      </p>
      <Status msg={msg} />
    </form>
  );
}

// Bio + Instagram (opsional, bisa disembunyikan) + maksimal 3 foto seperti feed.
export function ProfileInfoEditor() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [bio, setBio] = useState("");
  const [ig, setIg] = useState("");
  const [showIg, setShowIg] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pmsg, setPmsg] = useState<{ ok: boolean; text: string } | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.tempPassword) return;
    fetchProfile(user.absen)
      .then((d) => {
        setData(d);
        setBio(d.bio);
        setIg(d.ig);
        setShowIg(d.showIg);
      })
      .catch((e: Error) => setMsg({ ok: false, text: e.message }));
  }, [user]);

  if (!user) return null;
  if (user.tempPassword) return <p className="text-sm text-ink-3">Ganti password awal dulu sebelum mengisi profil.</p>;
  if (!data) return <p className="text-sm text-ink-3">Memuat profil…</p>;
  const left = BIO_MAX - [...bio].length;
  const handle = ig.trim().replace(/^@/, "");

  async function upload(f?: File) {
    if (!f || !user) return;
    setBusy(true);
    setPmsg(null);
    await run(
      async () => {
        const d = await compressImage(f);
        await adminFetch("/api/profil/foto", "POST", { data: d });
        setData(await fetchProfile(user.absen));
      },
      "Foto ditambahkan ke profil.",
      setPmsg,
    );
    setBusy(false);
    if (file.current) file.current.value = "";
  }

  async function remove(id: string) {
    if (!user || !confirm("Hapus foto ini dari profil?")) return;
    await run(
      async () => {
        await adminFetch(`/api/profil/foto?id=${id}`, "DELETE");
        setData(await fetchProfile(user.absen));
      },
      "Foto dihapus.",
      setPmsg,
    );
  }

  return (
    <div className="space-y-8">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await run(() => adminFetch("/api/profil", "PUT", { bio, ig: handle, showIg: showIg && !!handle }), "Profil tersimpan.", setMsg);
          setBusy(false);
        }}
      >
        <label className="block space-y-1.5">
          <span className="flex justify-between text-sm font-semibold text-ink-2">
            Bio <span className={`font-mono text-xs ${left < 0 ? "text-bad" : "text-ink-3"}`}>{left}</span>
          </span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Ceritakan sedikit tentang dirimu…" className={`${input} w-full resize-y py-2.5`} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink-2">Instagram (opsional)</span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-ink-3">@</span>
            <input value={ig} onChange={(e) => setIg(e.target.value)} maxLength={60} autoCapitalize="none" spellCheck={false} placeholder="username instagram" className={`${input} w-full max-w-xs font-mono`} />
          </span>
        </label>
        <label className="flex items-center gap-2.5 text-sm text-ink-2">
          <input type="checkbox" checked={showIg} disabled={!handle} onChange={(e) => setShowIg(e.target.checked)} className="h-4 w-4 accent-[#dd2a7b]" />
          Tampilkan tombol Instagram di profilku
        </label>
        {handle && showIg && (
          <div>
            <p className="mb-1.5 text-xs text-ink-3">Pratinjau:</p>
            <InstagramButton handle={handle} />
          </div>
        )}
        <button disabled={busy || left < 0} className={btn}>
          <Save size={15} /> Simpan profil
        </button>
        <Status msg={msg} />
      </form>

      <div id="foto-profil-feed" className="scroll-mt-28 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink-2">
            Foto di profil <span className="font-mono text-ink-3">{data.posts.length}/3</span>
          </p>
          <button type="button" disabled={busy || data.posts.length >= 3} onClick={() => file.current?.click()} className={btn}>
            <ImagePlus size={15} /> {busy ? "Memproses…" : "Tambah foto"}
          </button>
          <input ref={file} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => upload(e.target.files?.[0])} />
        </div>
        <p className="text-[13px] text-ink-3">Maksimal 3 foto. Foto otomatis dikecilkan jadi WebP ±200 KB. Hanya terlihat oleh teman sekelas yang sudah masuk; pakai foto yang sopan.</p>
        {data.posts.length > 0 && (
          <ul className="grid grid-cols-3 gap-2">
            {data.posts.map((p) => (
              <li key={p.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={postSrc(user.absen, p.id)} alt="" className="aspect-square w-full rounded-k2-md object-cover" />
                <button type="button" onClick={() => remove(p.id)} aria-label="Hapus foto" className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-rose-600">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <Status msg={pmsg} />
      </div>
    </div>
  );
}
