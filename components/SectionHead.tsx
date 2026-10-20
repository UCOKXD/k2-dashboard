// Kepala bagian v2: label bernomor mono ("01 · Ringkasan") + h2, aksi opsional di kanan.
export default function SectionHead({ no, label, title, children, id }: { no: string; label: string; title: string; children?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="k2-eyebrow">
          <span>
            {no} · {label}
          </span>
        </p>
        <h2 id={id} className="text-[clamp(26px,3vw,36px)] font-bold leading-[1.08]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
