"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ClipboardList, BookOpen, Cake, GraduationCap, History, Images, KeyRound, Lock, MessageCircle, MessageCircleHeart, Network, Armchair, Share2, UsersRound } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import OrgEditor from "@/components/admin/OrgEditor";
import PelEditor from "@/components/admin/PelEditor";
import GalleryEditor from "@/components/admin/GalleryEditor";
import BirthdayEditor from "@/components/admin/BirthdayEditor";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import TasksEditor from "@/components/admin/TasksEditor";
import HistoryTab from "@/components/admin/HistoryTab";
import AccountTab from "@/components/admin/AccountTab";
import NotifEditor from "@/components/admin/NotifEditor";
import NglAdmin from "@/components/admin/NglAdmin";
import { CawuEditor, FooterEditor } from "@/components/admin/CawuEditor";
import { Loading } from "@/components/admin/ui";
import { can } from "@/lib/admins";
import type { PermKey } from "@/lib/roles";

// perm: izin yang dibutuhkan (lib/roles.ts); "web" = khusus Admin Website; null = semua pengurus (ganti password sendiri).
const TABS: { id: string; label: string; icon: typeof Network; el: () => React.ReactNode; perm: PermKey | "web" | null }[] = [
  { id: "struktur", label: "Struktur & Peran", icon: Network, el: OrgEditor, perm: "web" },
  { id: "cawu", label: "Struktur per CAWU", icon: UsersRound, el: CawuEditor, perm: "web" },
  { id: "pelanggaran", label: "Pelanggaran", icon: AlertTriangle, el: PelEditor, perm: "pelanggaran" },
  { id: "galeri", label: "Galeri", icon: Images, el: GalleryEditor, perm: "galeri" },
  { id: "ultah", label: "Ulang Tahun", icon: Cake, el: BirthdayEditor, perm: "ultah" },
  { id: "jadwal", label: "Jadwal", icon: GraduationCap, el: ScheduleEditor, perm: "jadwal" },
  { id: "tugas", label: "Tugas", icon: ClipboardList, el: TasksEditor, perm: "tugas" },
  { id: "ngl", label: "NGL", icon: MessageCircleHeart, el: NglAdmin, perm: "ngl" },
  { id: "riwayat", label: "Riwayat", icon: History, el: HistoryTab, perm: "riwayat" },
  { id: "akun", label: "Akun", icon: KeyRound, el: AccountTab, perm: null },
  { id: "notifikasi", label: "Notifikasi WA", icon: MessageCircle, el: NotifEditor, perm: "web" },
  { id: "footer", label: "Media Sosial", icon: Share2, el: FooterEditor, perm: "web" },
];

export default function AdminPanel({ storeReady }: { storeReady: boolean }) {
  const { user, ready } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  // Hanya tab yang boleh dipakai peran akun ini yang ditampilkan.
  const tabs = TABS.filter((t) => (t.perm === "web" ? user?.webAdmin : t.perm ? can(user, t.perm) : true));
  const tab = tabs.find((t) => t.id === params.get("tab")) ?? tabs[0];

  if (!ready) return <Loading />;
  if (!user || !user.admin)
    return (
      <div className="k2-card mx-auto max-w-md space-y-4 p-8 text-center">
        <Lock className="mx-auto text-ink-3" />
        <p className="font-semibold text-ink-2">Halaman ini khusus pengurus kelas.</p>
        <Link href={user ? "/akun" : "/masuk"} className="inline-block rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow">
          {user ? "Ke halaman akun" : "Masuk"}
        </Link>
      </div>
    );

  // Password sementara wajib diganti dulu sebelum fitur admin lain bisa dipakai.
  if (user.tempPassword)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[clamp(36px,5vw,56px)] font-extrabold leading-none tracking-[-0.03em]">Panel Admin</h1>
          <p className="mt-3 text-[15px] text-ink-3">Halo, {user.panggilan} ({user.jabatan}).</p>
        </div>
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          Demi keamanan, ganti password sementara Anda dulu. Password sementara diketahui semua pengurus, jadi fitur admin baru terbuka setelah
          password diganti. Setelah itu, masuk lagi dengan password baru.
        </p>
        <AccountTab />
      </div>
    );

  const Active = tab.el;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="k2-eyebrow">K2 · Admin</p>
          <h1 className="mt-3.5 text-[clamp(36px,5vw,56px)] font-extrabold leading-none tracking-[-0.03em]">Panel Admin</h1>
          <p className="mt-3 max-w-[70ch] text-[15px] text-ink-3">
            Halo, {user.panggilan} ({user.jabatan}{user.webAdmin ? " · Admin Website" : ""}). Perubahan di sini langsung terlihat oleh semua pengunjung setelah disimpan.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          {can(user, "doa") && (
            <Link href="/doa-harian" className="flex min-h-10 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 font-semibold text-ink transition hover:border-ink-3">
              <BookOpen size={15} /> Acak Doa
            </Link>
          )}
          {can(user, "tempat_duduk") && (
            <Link href="/tempat-duduk" className="flex min-h-10 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 font-semibold text-ink transition hover:border-ink-3">
              <Armchair size={15} /> Atur Tempat Duduk
            </Link>
          )}
        </div>
      </div>

      {!storeReady && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Penyimpanan (Upstash Redis) belum dipasang di Vercel, jadi perubahan belum bisa disimpan. Pasang dulu di Vercel &gt; Storage &gt; Upstash for Redis.
        </p>
      )}

      <div role="tablist" aria-label="Fitur Panel Admin" className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1 shadow-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tab.id}
            onClick={() => router.replace(`${path}?tab=${t.id}`, { scroll: false })}
            className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
              t.id === tab.id ? "bg-[#0b1e3d] text-white dark:bg-[#2e9be0] dark:text-[#061227]" : "text-ink-3 hover:bg-surface-2 hover:text-ink"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <Active key={tab.id} />
    </div>
  );
}
