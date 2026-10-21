import { Music2 } from "lucide-react";

// Tombol bertema TikTok (hitam dengan bayangan cyan & merah muda khas) yang membuka profil TikTok siswa.
export default function TikTokButton({ handle }: { handle: string }) {
  return (
    <a
      href={`https://www.tiktok.com/@${encodeURIComponent(handle)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#010101] px-4 text-sm font-semibold text-white shadow-[-3px_3px_0_-1px_#25f4ee,3px_-3px_0_-1px_#fe2c55] ring-1 ring-white/10 transition hover:shadow-[-4px_4px_0_-1px_#25f4ee,4px_-4px_0_-1px_#fe2c55] dark:ring-white/25"
    >
      <span className="relative grid h-6 w-6 place-items-center" aria-hidden="true">
        <Music2 size={16} strokeWidth={2.6} className="absolute -translate-x-[1.5px] translate-y-[1px] text-[#25f4ee]" />
        <Music2 size={16} strokeWidth={2.6} className="absolute translate-x-[1.5px] -translate-y-[1px] text-[#fe2c55]" />
        <Music2 size={16} strokeWidth={2.6} className="relative text-white" />
      </span>
      <span>
        TikTok <span className="font-mono text-[13px] opacity-95">@{handle}</span>
      </span>
    </a>
  );
}
