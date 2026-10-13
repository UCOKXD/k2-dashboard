"use client";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { usePerm } from "@/components/AuthProvider";
import type { PermKey } from "@/lib/roles";

// Tombol pintas ke Panel Admin, hanya muncul untuk admin yang sudah masuk.
export default function AdminLink({ href, label, perm }: { href: string; label: string; perm: PermKey }) {
  const user = usePerm(perm); // hanya untuk peran yang punya izin fitur ini
  if (!user) return null;
  return (
    <Link href={href} className="flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(11,30,61,0.35)] transition hover:bg-navy-800">
      <Settings2 size={15} /> {label}
    </Link>
  );
}
