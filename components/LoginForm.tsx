"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Sticker from "@/components/Sticker";
import type { SessionUser } from "@/lib/admins";

// Sesudah masuk: admin ke Panel Admin; siswa ke halaman Akun (wajib ganti password awal) atau beranda.
const home = (u: SessionUser) => (u.admin ? "/admin" : u.tempPassword ? "/akun" : "/");

export default function LoginForm() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace(home(user));
  }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const d = (await res.json()) as { error?: string; user?: SessionUser };
      if (!res.ok || !d.user) throw new Error(d.error ?? "Gagal masuk");
      await refresh();
      router.replace(home(d.user));
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  const field = "min-h-[46px] w-full rounded-k2-md border border-line-strong bg-surface px-3.5 text-[15px] text-ink outline-none transition placeholder:text-ink-3 hover:border-ink-3 focus:border-sea-500 focus:shadow-[0_0_0_3px_rgba(46,155,224,0.25)]";

  return (
    <div className="mx-auto grid max-w-[1100px] items-center gap-[clamp(32px,6vw,80px)] py-[clamp(24px,5vw,72px)] min-[861px]:grid-cols-[1fr_minmax(320px,440px)]">
      {/* Maskot menyapa; berganti jadi "Waduh!" kalau login ditolak. */}
      <div className="flex flex-col items-center text-center min-[861px]:items-start min-[861px]:text-left">
        <Sticker name={error ? "waduh" : "halo"} size={220} />
        <h1 className="mt-5 text-[clamp(36px,5vw,60px)] font-extrabold leading-none tracking-[-0.03em]">Selamat datang kembali</h1>
        <p className="mt-3.5 max-w-[40ch] text-[17px] text-ink-3">Setiap siswa ABSORBING punya akun sendiri. Pengurus (BPH &amp; K2) juga bisa membuka Panel Admin.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-[18px] rounded-k2-xl border border-line bg-surface p-[clamp(24px,3vw,36px)] shadow-3">
        <div className="flex gap-2">
          <Image src="/logo-k2.png" alt="Logo Divisi K2" width={48} height={49} className="h-12 w-12 object-contain" />
          <Image src="/logo-absorbing.png" alt="Logo kelas Absorbing" width={48} height={50} className="h-12 w-12 object-contain" />
        </div>
        <div>
          <h2 className="text-[28px] font-bold">Masuk</h2>
          <p className="mt-1 text-sm text-ink-3">Untuk siswa ABSORBING. Melihat info kelas tetap bisa tanpa masuk.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink-2">Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" placeholder="mis. Ancis18" className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink-2">Password</span>
          <span className="relative block">
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={`${field} pr-12`} />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-k2-md text-ink-3 hover:bg-surface-2 hover:text-ink"
              aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
              aria-pressed={show}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-k2-md bg-bad-soft px-3.5 py-2.5 text-sm font-semibold text-bad">
            {error}
          </p>
        )}

        <button
          disabled={busy || !username || !password}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-semibold text-[var(--on-accent)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <LogIn size={17} /> {busy ? "Memeriksa..." : "Masuk"}
        </button>
        <p className="text-center text-[13px] text-ink-3">
          Username awal = nama panggilan + nomor absen, mis. <span className="font-mono">Ancis18</span> (atau username yang sudah kamu ganti). Password awal dibagikan Divisi K2 dan wajib diganti saat pertama masuk. Lupa
          password atau username? Minta pengurus BPH atau K2 untuk mereset.
        </p>
      </form>
    </div>
  );
}
