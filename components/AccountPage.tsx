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
        <Lock className="mx-auto text-ink-3" />
        <p className="font-semibold text-ink-2">Masuk dulu untuk membuka halaman akun.</p>
        <Link href="/masuk" className="inline-block rounded-k2-md bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow">
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
        <Link href={`/profil/${user.absen}`} className="inline-flex min-h-11 items-center gap-2 rounded-k2-md border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-ink-3">
          <Eye size={15} /> Lihat profilku
        </Link>
      </div>

      {user.tempPassword && (
        <p className="flex items-start gap-2 rounded-2xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm font-medium text-rose-800">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          Kamu masih memakai password awal yang mudah ditebak orang lain. Ganti dulu dengan password milikmu sendiri, lalu masuk lagi dengan password
          baru.
        </p>
      )}

      <Panel title="Info Akun">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 sm:col-span-2">
            <UserRound size={18} className="text-accent-ink" />
            <div>
              <dt className="sr-only">Nama</dt>
              <dd className="font-semibold text-ink">{user.nama}</dd>
              <dd className="text-xs text-ink-3">{user.admin ? `${user.jabatan} · ${GRUP_LABEL[user.grup]}${user.webAdmin ? " · Admin Website" : ""}` : GRUP_LABEL.Siswa}</dd>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface px-4 py-3">
            <dt className="text-xs font-semibold text-ink-3">Username</dt>
            <dd className="font-mono font-semibold text-ink">{user.login}</dd>
          </div>
          <div className="rounded-2xl border border-line bg-surface px-4 py-3">
            <dt className="text-xs font-semibold text-ink-3">Nomor absen</dt>
            <dd className="font-mono font-semibold text-ink">{user.absen}</dd>
          </div>
        </dl>
        {user.admin && (
          <Link href="/admin" className="flex min-h-11 w-fit items-center gap-1.5 rounded-k2-md border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-ink-3">
            <LayoutDashboard size={15} /> Buka Panel Admin
          </Link>
        )}
      </Panel>

      <Panel title="Foto Profil" desc="Tampil di tombol akun, daftar teman di NGL, dan banner ulang tahun.">
        <ProfilePhoto />
      </Panel>

      <Panel title="Bio, media sosial & foto" desc="Terlihat oleh teman sekelas yang sudah masuk.">
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
