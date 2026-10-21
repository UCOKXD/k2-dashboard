import { Camera } from "lucide-react";

// Tombol bertema Instagram (gradasi khas) yang membuka profil Instagram siswa.
export default function InstagramButton({ handle }: { handle: string }) {
  return (
    <a
      href={`https://www.instagram.com/${encodeURIComponent(handle)}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[linear-gradient(45deg,#f58529_0%,#dd2a7b_45%,#8134af_75%,#515bd4_100%)] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(221,42,123,0.7)] transition hover:brightness-110"
    >
      <span className="grid h-6 w-6 place-items-center rounded-[7px] border-2 border-white/90">
        <Camera size={13} strokeWidth={2.5} />
      </span>
      <span>
        Instagram <span className="font-mono text-[13px] opacity-95">@{handle}</span>
      </span>
    </a>
  );
}
