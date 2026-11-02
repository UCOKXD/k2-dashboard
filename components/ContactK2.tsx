import { MessageCircle } from "lucide-react";

// Nomor WhatsApp Divisi K2 (sama dengan footer beranda).
export const WA_K2 = "https://wa.me/6285134733707";
export const WA_K2_TEXT = "0851-3473-3707";

// Baris kontak di bawah judul halaman Izin & Izin Sakit.
export default function ContactK2({ text }: { text: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-k2-lg border border-ok/30 bg-ok-soft px-5 py-3.5 shadow-1">
      <p className="text-sm font-medium text-emerald-900">{text}</p>
      <a
        href={WA_K2}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center gap-2 rounded-k2-md bg-[#047857] px-5 text-sm font-bold text-white transition hover:bg-[#065f46]"
      >
        <MessageCircle size={16} /> Hubungi K2
        <span className="font-mono text-xs font-semibold text-white/90">{WA_K2_TEXT}</span>
      </a>
    </div>
  );
}
