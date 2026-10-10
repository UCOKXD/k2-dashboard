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
      <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Password lama / password awal" autoComplete="current-password" className={input} />
      <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Password baru (minimal 6 karakter)" autoComplete="new-password" className={input} />
      <input type="password" value={again} onChange={(e) => setAgain(e.target.value)} placeholder="Ulangi password baru" autoComplete="new-password" className={input} />
      <button disabled={busy || !oldPw || !newPw || !again} className="flex w-fit items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow disabled:opacity-40">
        <KeyRound size={14} /> {busy ? "Menyimpan..." : "Ganti password"}
      </button>
      {msg && <p className={`text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>{msg.text}</p>}
    </form>
  );
}
