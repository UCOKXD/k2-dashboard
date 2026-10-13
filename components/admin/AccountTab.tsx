"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, RotateCcw, TriangleAlert } from "lucide-react";
import { adminFetch, useAuth } from "@/components/AuthProvider";
import PasswordForm from "@/components/PasswordForm";
import { ACCOUNTS, can, type Grup } from "@/lib/admins";
import { Panel, smallBtn } from "@/components/admin/ui";

type Status = { username: string; jabatan: string; grup: Grup; admin: boolean; webAdmin: boolean; changed: boolean; birthday: boolean };

export default function AccountTab() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Record<string, Status> | null>(null);
  const [resetMsg, setResetMsg] = useState("");
  const [filter, setFilter] = useState<"semua" | "admin" | "siswa">("semua");

  // Daftar semua akun & reset password: peran dengan izin "Akun" (lihat Struktur & Peran).
  const canSee = can(user, "akun") && !user?.tempPassword;
  const canReset = canSee;

  useEffect(() => {
    if (!user || user.tempPassword || !can(user, "akun")) return;
    fetch("/api/auth/reset", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { items?: Status[] }) => d.items && setStatus(Object.fromEntries(d.items.map((s) => [s.username, s]))))
      .catch(() => {});
  }, [user]);

  async function reset(username: string, panggilan: string) {
    const awal = "password awal (nomor absen + tanggal lahir)";
    if (!confirm(`Reset password ${panggilan} ke ${awal}?`)) return;
    try {
      const r = await adminFetch<{ temp: string | null }>("/api/auth/reset", "POST", { username });
      setResetMsg(r.temp ? `Password ${panggilan} sekarang: ${r.temp} — minta ${panggilan} segera menggantinya.` : `Password ${panggilan} direset, tapi tanggal lahirnya belum terdata di tab Ulang Tahun.`);
      setStatus((s) => (s && s[username] ? { ...s, [username]: { ...s[username], changed: false } } : s));
    } catch (err) {
      setResetMsg((err as Error).message);
    }
  }

  if (!user) return null;
  // Peran terbaru dari server (mengikuti tab Struktur); sebelum termuat pakai struktur bawaan.
  const rows = ACCOUNTS.map((a) => ({ ...a, ...(status?.[a.username] ?? {}) }));
  const list = rows.filter((a) => (filter === "semua" ? true : filter === "admin" ? a.admin : !a.admin));
  const vals = status ? Object.values(status) : [];
  const belum = vals.filter((s) => !s.changed).length;
  const tanpaTgl = vals.filter((s) => !s.birthday).length;

  return (
    <div className="space-y-6">
      <Panel title="Ganti Password" desc={`Masuk sebagai ${user.username} (${user.jabatan}).`}>
        <PasswordForm />
      </Panel>

      {canSee && (
        <Panel
          title="Semua Akun"
          desc="Setiap siswa punya akun: username = panggilan + nomor absen. Password awal = nomor absen + tanggal lahir (DDMM), mis. absen 5 lahir 9 Maret → 50903 (8 pengurus pertama juga masih bisa memakai password sementara admin). Semua wajib mengganti password saat pertama masuk. Peran mengikuti tab Struktur & Peran."
        >
          {status && (
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{vals.length - belum} sudah ganti password</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{belum} masih password awal</span>
              {tanpaTgl > 0 && <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">{tanpaTgl} belum ada tanggal lahir (belum bisa masuk)</span>}
            </div>
          )}
          <div className="flex gap-1.5">
            {(["semua", "admin", "siswa"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === f ? "bg-navy-900 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Absen</th>
                  <th className="px-3 py-2.5">Nama</th>
                  <th className="px-3 py-2.5">Peran</th>
                  <th className="px-3 py-2.5">Username</th>
                  <th className="px-3 py-2.5">Password</th>
                  {canReset && <th className="px-3 py-2.5" />}
                </tr>
              </thead>
              <tbody>
                {list.map((a) => {
                  const s = status?.[a.username];
                  return (
                    <tr key={a.username} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-mono text-slate-500">{a.absen}</td>
                      <td className="px-3 py-2">{a.nama}</td>
                      <td className="px-3 py-2 text-slate-500">
                        {a.jabatan}
                        {a.webAdmin && <span className="ml-1.5 rounded-full bg-navy-900 px-2 py-0.5 text-[11px] font-semibold text-white">Admin Website</span>}
                      </td>
                      <td className="px-3 py-2 font-mono">{a.username}</td>
                      <td className="px-3 py-2 text-xs font-semibold">
                        {!s ? (
                          <span className="text-slate-400">…</span>
                        ) : !s.birthday && !s.changed ? (
                          <span className="flex items-center gap-1 text-rose-600">
                            <TriangleAlert size={13} /> Isi tgl lahir dulu
                          </span>
                        ) : s.changed ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 size={13} /> Sudah diganti
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Circle size={13} /> Masih awal
                          </span>
                        )}
                      </td>
                      {canReset && (
                        <td className="px-3 py-2 text-right">
                          {a.username !== user.username && !a.webAdmin && (
                            <button onClick={() => reset(a.username, a.panggilan)} className={`${smallBtn} inline-flex items-center gap-1`}>
                              <RotateCcw size={12} /> Reset
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {resetMsg && <p className="text-sm font-medium text-slate-700">{resetMsg}</p>}
        </Panel>
      )}
    </div>
  );
}
