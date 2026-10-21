// Tombol bertema LinkedIn (biru khas dengan kotak "in") yang membuka profil LinkedIn siswa.
export default function LinkedInButton({ handle }: { handle: string }) {
  return (
    <a
      href={`https://www.linkedin.com/in/${encodeURIComponent(handle)}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full bg-[#0a66c2] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(10,102,194,0.75)] transition hover:bg-[#004182]"
    >
      <span className="grid h-6 w-6 place-items-center shrink-0 rounded-[5px] bg-[#fff] font-sans text-[13px] font-extrabold leading-none tracking-[-0.04em] text-[#0a66c2]" aria-hidden="true">
        in
      </span>
      <span>
        LinkedIn <span className="break-all font-mono text-[13px] opacity-95">/{handle}</span>
      </span>
    </a>
  );
}
