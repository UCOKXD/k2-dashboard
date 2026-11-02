"use client";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { usePerm } from "@/components/AuthProvider";
import type { PermKey } from "@/lib/roles";

// Tombol pintas ke Panel Admin di kepala halaman, hanya muncul untuk admin yang sudah masuk.
export default function AdminLink({ href, label, perm }: { href: string; label: string; perm: PermKey }) {
  const user = usePerm(perm); // hanya untuk peran yang punya izin fitur ini
  if (!user) return null;
  return (
    <Link href={href} className="flex min-h-11 items-center gap-1.5 rounded-k2-md border border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition hover:border-ink-3">
      <Settings2 size={15} aria-hidden="true" /> {label}
    </Link>
  );
}
