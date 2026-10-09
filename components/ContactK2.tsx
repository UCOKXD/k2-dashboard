import { MessageCircle } from "lucide-react";

// Nomor WhatsApp Divisi K2 (sama dengan footer beranda).
export const WA_K2 = "https://wa.me/6285134733707";
export const WA_K2_TEXT = "0851-3473-3707";

// Baris kontak di bawah judul halaman Izin & Izin Sakit.
export default function ContactK2({ text }: { text: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-3.5 shadow-[0_14px_34px_rgba(15,23,42,0.12)] backdrop-blur-md">
      <p className="text-sm font-medium text-emerald-900">{text}</p>
      <a
        href={WA_K2}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
      >
        <MessageCircle size={16} /> Hubungi K2
        <span className="font-mono text-xs font-semibold text-white/90">{WA_K2_TEXT}</span>
      </a>
    </div>
  );
}
