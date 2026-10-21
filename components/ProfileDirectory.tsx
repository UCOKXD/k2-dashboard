"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { avatarSrc, useAvatars } from "@/components/useAvatars";
import { STUDENTS } from "@/lib/students";

// Daftar 34 siswa ABSORBING; klik untuk membuka profilnya (profil hanya bisa dibuka setelah masuk).
export default function ProfileDirectory() {
  const avatars = useAvatars();
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      {!user && <p className="k2-card p-4 text-sm text-ink-2">Masuk dulu supaya bisa membuka profil teman.</p>}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {STUDENTS.map((s) => {
          const src = avatarSrc(avatars, s.absen);
          return (
            <li key={s.absen}>
              <Link
                href={`/profil/${s.absen}`}
                className={`flex h-full items-center gap-3 rounded-k2-md border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-2 ${user?.absen === s.absen ? "border-accent" : "border-line"}`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-sea-500 to-navy-700 font-display font-bold text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {src ? <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" /> : s.short[0]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{s.full}</span>
                  <span className="block font-mono text-xs text-ink-3">
                    {String(s.absen).padStart(2, "0")} · {s.short}
                    {user?.absen === s.absen && " · kamu"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
