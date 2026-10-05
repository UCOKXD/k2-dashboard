"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, BookOpen, Cake, GraduationCap, History, Images, KeyRound, Lock, Network, Presentation, Armchair } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import OrgEditor from "@/components/admin/OrgEditor";
import PelEditor from "@/components/admin/PelEditor";
import SlidesEditor from "@/components/admin/SlidesEditor";
import GalleryEditor from "@/components/admin/GalleryEditor";
import BirthdayEditor from "@/components/admin/BirthdayEditor";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import HistoryTab from "@/components/admin/HistoryTab";
import AccountTab from "@/components/admin/AccountTab";

const TABS = [
  { id: "struktur", label: "Struktur", icon: Network, el: OrgEditor },
  { id: "pelanggaran", label: "Pelanggaran", icon: AlertTriangle, el: PelEditor },
  { id: "banner", label: "Foto Banner", icon: Presentation, el: SlidesEditor },
  { id: "galeri", label: "Galeri", icon: Images, el: GalleryEditor },
  { id: "ultah", label: "Ulang Tahun", icon: Cake, el: BirthdayEditor },
  { id: "jadwal", label: "Jadwal", icon: GraduationCap, el: ScheduleEditor },
  { id: "riwayat", label: "Riwayat", icon: History, el: HistoryTab },
  { id: "akun", label: "Akun", icon: KeyRound, el: AccountTab },
] as const;

export default function AdminPanel({ storeReady }: { storeReady: boolean }) {
  const { user, ready } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const tab = TABS.find((t) => t.id === params.get("tab")) ?? TABS[0];

  if (!ready) return <p className="text-sm text-slate-500">Memuat...</p>;
  if (!user)
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-[2rem] border border-white/60 bg-white/75 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.22)] backdrop-blur-md">
        <Lock className="mx-auto text-slate-400" />
        <p className="font-semibold text-slate-700">Halaman ini khusus admin (BPH & Divisi K2).</p>
        <Link href="/masuk" className="inline-block rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow">
          Masuk
        </Link>
      </div>
    );

  const Active = tab.el;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Panel Admin</h2>
          <p className="text-sm text-slate-500">
            Halo, {user.panggilan} ({user.jabatan}). Perubahan di sini langsung terlihat oleh semua pengunjung setelah disimpan.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/doa-harian" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 font-semibold text-slate-700 shadow-sm">
            <BookOpen size={15} /> Acak Doa
          </Link>
          <Link href="/tempat-duduk" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 font-semibold text-slate-700 shadow-sm">
            <Armchair size={15} /> Atur Tempat Duduk
          </Link>
        </div>
      </div>

      {!storeReady && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Penyimpanan (Upstash Redis) belum dipasang di Vercel, jadi perubahan belum bisa disimpan. Pasang dulu di Vercel &gt; Storage &gt; Upstash for Redis.
        </p>
      )}
      {user.tempPassword && tab.id !== "akun" && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          Anda masih memakai password sementara.{" "}
          <Link href="/admin?tab=akun" className="font-bold underline">
            Ganti password sekarang
          </Link>
        </p>
      )}

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-full border border-white/60 bg-white/70 p-1.5 shadow-[0_14px_34px_rgba(15,23,42,0.16)] backdrop-blur-md">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => router.replace(`${path}?tab=${t.id}`, { scroll: false })}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${t.id === tab.id ? "bg-navy-900 text-white shadow" : "text-slate-600 hover:bg-white"}`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <Active key={tab.id} />
    </div>
  );
}
