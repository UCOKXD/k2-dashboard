"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Sticker from "@/components/Sticker";

export default function LoginForm() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace("/admin");
  }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Gagal masuk");
      await refresh();
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 pt-2 sm:pt-6 lg:gap-12">
      {/* Maskot menyapa; berganti jadi "Waduh!" kalau login ditolak. */}
      <div className="flex flex-[0_1_22rem] flex-col items-center gap-2 text-center sm:gap-4">
        <Sticker name={error ? "waduh" : "halo"} size={220} />
        <div>
          <p className="text-xl font-extrabold text-navy-900 sm:text-2xl">Selamat datang kembali</p>
          <p className="mt-1 text-sm text-slate-600">Masuk untuk memperbarui jadwal, tugas, pelanggaran, galeri, dan struktur kelas.</p>
        </div>
      </div>
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-[2rem] border border-white/60 bg-white/75 p-7 shadow-[0_28px_70px_rgba(15,23,42,0.25)] backdrop-blur-md sm:p-9">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex gap-2">
            <Image src="/logo-k2.png" alt="Logo Divisi K2" width={56} height={57} className="h-14 w-14 object-contain" />
            <Image src="/logo-absorbing.png" alt="Logo kelas Absorbing" width={56} height={59} className="h-14 w-14 object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900">Masuk Admin</h2>
            <p className="text-sm text-slate-500">Khusus BPH dan Divisi K2. Pengunjung lain cukup melihat tanpa masuk.</p>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            placeholder="mis. Ancis18"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sea-500 focus:ring-2 focus:ring-sea-500/30"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm outline-none focus:border-sea-500 focus:ring-2 focus:ring-sea-500/30"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={show ? "Sembunyikan password" : "Tampilkan password"}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>

        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}

        <button disabled={busy || !username || !password} className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 font-bold text-white shadow-[0_12px_28px_rgba(11,30,61,0.4)] transition hover:bg-navy-800 disabled:opacity-50">
          <LogIn size={17} /> {busy ? "Memeriksa..." : "Masuk"}
        </button>
        <p className="text-center text-xs text-slate-400">Username = nama panggilan + nomor absen. Lupa password? Minta Komti atau Koordinator K2 untuk mereset.</p>
      </form>
    </div>
  );
}
