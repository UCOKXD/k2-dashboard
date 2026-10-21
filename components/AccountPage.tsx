"use client";
import Link from "next/link";
import { Eye, LayoutDashboard, Lock, ShieldAlert, UserRound } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import PasswordForm from "@/components/PasswordForm";
import ProfilePhoto from "@/components/ProfilePhoto";
import { ProfileInfoEditor, UsernameForm } from "@/components/ProfileEditor";
import { Loading, Panel } from "@/components/admin/ui";
import { GRUP_LABEL } from "@/lib/admins";

// Halaman akun untuk semua siswa: info akun + ganti password (wajib saat masih memakai password awal).
export default function AccountPage() {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!user)
    return (
      <div className="k2-card mx-auto max-w-md space-y-4 p-8 text-center">
        <Lock className="mx-auto text-slate-400" />
        <p className="font-semibold text-slate-700">Masuk dulu untuk membuka halaman akun.</p>
        <Link href="/masuk" className="inline-block rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow">
          Masuk
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="k2-eyebrow">K2 · Profil</p>
          <h1 className="mt-3 text-[clamp(32px,4.5vw,48px)] font-extrabold leading-none tracking-[-0.03em]">Edit profil</h1>
          <p className="mt-2 text-[15px] text-ink-3">Halo, {user.panggilan}!</p>
        </div>
        <Link href={`/profil/${user.absen}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-ink-3">
          <Eye size={15} /> Lihat profilku
        </Link>
      </div>

      {user.tempPassword && (
        <p className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          Kamu masih memakai password awal yang mudah ditebak orang lain. Ganti dulu dengan password milikmu sendiri, lalu masuk lagi dengan password
          baru.
        </p>
      )}

      <Panel title="Info Akun">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:col-span-2">
            <UserRound size={18} className="text-sea-600" />
            <div>
              <dt className="sr-only">Nama</dt>
              <dd className="font-semibold text-slate-800">{user.nama}</dd>
              <dd className="text-xs text-slate-500">{user.admin ? `${user.jabatan} · ${GRUP_LABEL[user.grup]}${user.webAdmin ? " · Admin Website" : ""}` : GRUP_LABEL.Siswa}</dd>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Username</dt>
            <dd className="font-mono font-semibold text-slate-800">{user.login}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nomor absen</dt>
            <dd className="font-mono font-semibold text-slate-800">{user.absen}</dd>
          </div>
        </dl>
        {user.admin && (
          <Link href="/admin" className="flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <LayoutDashboard size={15} /> Buka Panel Admin
          </Link>
        )}
      </Panel>

      <Panel title="Foto Profil" desc="Tampil di tombol akun, daftar teman di NGL, dan banner ulang tahun.">
        <ProfilePhoto />
      </Panel>

      <Panel title="Bio, Instagram, TikTok & foto" desc="Terlihat oleh teman sekelas yang sudah masuk.">
        <ProfileInfoEditor />
      </Panel>

      <Panel title="Username" desc="Username dipakai untuk masuk.">
        {user.tempPassword ? <p className="text-sm text-ink-3">Ganti password awal dulu sebelum mengganti username.</p> : <UsernameForm />}
      </Panel>

      <Panel title="Ganti Password" desc="Minimal 6 karakter. Setelah diganti, kamu akan diminta masuk lagi.">
        <PasswordForm />
      </Panel>
    </div>
  );
}
