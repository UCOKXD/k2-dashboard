"use client";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

// Tombol pintas ke Panel Admin, hanya muncul untuk admin yang sudah masuk.
export default function AdminLink({ href, label }: { href: string; label: string }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Link href={href} className="flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(11,30,61,0.35)] transition hover:bg-navy-800">
      <Settings2 size={15} /> {label}
    </Link>
  );
}
