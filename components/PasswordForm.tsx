"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import { input } from "@/components/admin/ui";

// Form ganti password untuk semua akun (siswa & admin). Setelah berhasil, wajib masuk ulang.
export default function PasswordForm() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [again, setAgain] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function change(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (newPw !== again) return setMsg({ ok: false, text: "Konfirmasi password baru tidak sama" });
    setBusy(true);
    try {
      await adminFetch("/api/auth/password", "POST", { oldPassword: oldPw, newPassword: newPw });
      setMsg({ ok: true, text: "Password diganti. Silakan masuk lagi dengan password baru." });
      await refresh();
      setTimeout(() => router.push("/masuk"), 1500);
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={change} className="grid max-w-md gap-3">
      <label className="grid gap-1 text-sm font-semibold text-ink-2">
        Password lama atau password awal
        <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" className={input} />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-ink-2">
        Password baru (minimal 6 karakter)
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" className={input} />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-ink-2">
        Ulangi password baru
        <input type="password" value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" className={input} />
      </label>
      <button disabled={busy || !oldPw || !newPw || !again} className="flex min-h-11 w-fit items-center gap-1.5 rounded-k2-md bg-[#0b1e3d] px-5 text-sm font-semibold text-white disabled:opacity-40 dark:bg-[#2e9be0] dark:text-[#061227]">
        <KeyRound size={14} /> {busy ? "Menyimpan..." : "Ganti password"}
      </button>
      {msg && <p className={`text-sm font-medium ${msg.ok ? "text-ok" : "text-bad"}`}>{msg.text}</p>}
    </form>
  );
}
