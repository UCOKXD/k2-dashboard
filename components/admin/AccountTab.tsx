"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound, RotateCcw } from "lucide-react";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import { ADMINS } from "@/lib/admins";
import { Panel, input, smallBtn } from "@/components/admin/ui";

const CAN_RESET = ["Komti", "Koordinator K2"];

export default function AccountTab() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [again, setAgain] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

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

  async function reset(username: string, panggilan: string) {
    if (!confirm(`Reset password ${panggilan} ke password sementara?`)) return;
    try {
      const r = await adminFetch<{ temp: string }>("/api/auth/reset", "POST", { username });
      setResetMsg(`Password ${panggilan} sekarang: ${r.temp}`);
    } catch (err) {
      setResetMsg((err as Error).message);
    }
  }

  if (!user) return null;
  return (
    <div className="space-y-6">
      <Panel title="Ganti Password" desc={`Masuk sebagai ${user.username} (${user.jabatan}).`}>
        <form onSubmit={change} className="grid max-w-md gap-3">
          <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Password lama" autoComplete="current-password" className={input} />
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Password baru (minimal 6 karakter)" autoComplete="new-password" className={input} />
          <input type="password" value={again} onChange={(e) => setAgain(e.target.value)} placeholder="Ulangi password baru" autoComplete="new-password" className={input} />
          <button disabled={busy || !oldPw || !newPw} className="flex w-fit items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow disabled:opacity-40">
            <KeyRound size={14} /> {busy ? "Menyimpan..." : "Ganti password"}
          </button>
          {msg && <p className={`text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>{msg.text}</p>}
        </form>
      </Panel>

      <Panel title="Akun Admin" desc="Username = panggilan + nomor absen. Komti dan Koordinator K2 dapat mereset password admin lain yang lupa.">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Nama</th>
                <th className="px-3 py-2.5">Jabatan</th>
                <th className="px-3 py-2.5">Username</th>
                {CAN_RESET.includes(user.jabatan) && <th className="px-3 py-2.5" />}
              </tr>
            </thead>
            <tbody>
              {ADMINS.map((a) => (
                <tr key={a.username} className="border-t border-slate-100">
                  <td className="px-3 py-2">{a.nama}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {a.jabatan} · {a.grup}
                  </td>
                  <td className="px-3 py-2 font-mono">{a.username}</td>
                  {CAN_RESET.includes(user.jabatan) && (
                    <td className="px-3 py-2 text-right">
                      {a.username !== user.username && (
                        <button onClick={() => reset(a.username, a.panggilan)} className={`${smallBtn} inline-flex items-center gap-1`}>
                          <RotateCcw size={12} /> Reset
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {resetMsg && <p className="text-sm font-medium text-slate-700">{resetMsg}</p>}
      </Panel>
    </div>
  );
}
