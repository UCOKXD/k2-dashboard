"use client";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

// Menjeda chip logo yang terus mengambang (DESIGN.md: gerak hias terus-menerus wajib bisa dijeda).
// Status dipasang sebagai atribut data-pf-diam di <html>; CSS di portofolio.css yang menghentikan animasinya.
export default function TombolJeda() {
  const [diam, setDiam] = useState(false);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-pf-diam", diam);
  }, [diam]);
  useEffect(() => () => document.documentElement.removeAttribute("data-pf-diam"), []);

  const label = diam ? "Putar animasi" : "Jeda animasi";
  return (
    <button
      type="button"
      aria-pressed={diam}
      aria-label={label}
      onClick={() => setDiam((d) => !d)}
      className="pf-pop inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-k2-md px-2 text-[13px] font-semibold text-ink-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {diam ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}
