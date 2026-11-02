// Kepala bagian: label konteks kecil + h2, aksi opsional di kanan.
export default function SectionHead({ label, title, children, id }: { label: string; title: string; children?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="k2-eyebrow">{label}</p>
        <h2 id={id} className="text-[clamp(26px,3vw,36px)] font-bold leading-[1.08]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
