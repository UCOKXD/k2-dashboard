"use client";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { usePerm } from "@/components/AuthProvider";
import type { PermKey } from "@/lib/roles";

// Tombol pintas ke Panel Admin (putih, di kepala halaman biru), hanya muncul untuk admin yang sudah masuk.
export default function AdminLink({ href, label, perm }: { href: string; label: string; perm: PermKey }) {
  const user = usePerm(perm); // hanya untuk peran yang punya izin fitur ini
  if (!user) return null;
  return (
    <Link href={href} className="flex min-h-10 items-center gap-1.5 rounded-full bg-[#fff] px-4 text-sm font-semibold text-[#0b1e3d] transition hover:bg-[#f1f8fd]">
      <Settings2 size={15} /> {label}
    </Link>
  );
}
